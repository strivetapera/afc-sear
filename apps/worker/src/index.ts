import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaClient } from '@afc-sear/db';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const prisma = new PrismaClient();

interface CampaignJobData {
  type: 'SEND_CAMPAIGN';
  payload: {
    id: string;
  };
}

interface FinanceReportJobData {
  type: 'GENERATE_FINANCE_REPORT';
  payload: {
    month: string;
    branchId?: string;
  };
}

type JobData = CampaignJobData | FinanceReportJobData;

async function sendCampaign(campaignId: string): Promise<void> {
  console.log(`[Worker] Fetching campaign ${campaignId}...`);
  
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      recipients: {
        include: { campaign: true },
      },
    },
  });

  if (!campaign) {
    throw new Error(`Campaign ${campaignId} not found`);
  }

  if (campaign.status !== 'APPROVED' && campaign.status !== 'SENDING') {
    throw new Error(`Campaign ${campaignId} is not in a sendable state: ${campaign.status}`);
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: 'SENDING' },
  });

  const audienceFilter = campaign.audienceFilter as any;
  let members: { id: string; email: string | null; phone: string | null; firstName: string | null; }[] = [];

  if (audienceFilter?.branchId) {
    members = await prisma.person.findMany({
      where: { branchId: audienceFilter.branchId },
      select: { id: true, email: true, phone: true, firstName: true },
    });
  } else {
    members = await prisma.person.findMany({
      where: { email: { not: null } },
      select: { id: true, email: true, phone: true, firstName: true },
    });
  }

  const filterTags = audienceFilter?.tags || [];
  const filterLifecycleStage = audienceFilter?.lifecycleStage;

  if (filterLifecycleStage) {
    members = members.filter(m => {
      return true;
    });
  }

  console.log(`[Worker] Sending ${campaign.channel} campaign to ${members.length} recipients...`);

  const deliveryPromises = members.map(async (member) => {
    const deliveryStatus = Math.random() > 0.05 ? 'DELIVERED' : 'FAILED';
    
    await prisma.deliveryLog.create({
      data: {
        channel: campaign.channel,
        provider: getProviderForChannel(campaign.channel),
        personId: member.id,
        campaignId: campaign.id,
        status: deliveryStatus,
        errorMessage: deliveryStatus === 'FAILED' ? 'Simulated delivery failure' : null,
      },
    });

    await prisma.messageRecipient.updateMany({
      where: { campaignId: campaign.id, personId: member.id },
      data: { deliveryStatus },
    });
  });

  await Promise.all(deliveryPromises);

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: 'SENT' },
  });

  console.log(`[Worker] Campaign ${campaignId} sent successfully!`);
}

async function generateFinanceReport(month: string, branchId?: string): Promise<void> {
  console.log(`[Worker] Generating finance report for ${month}${branchId ? ` (branch: ${branchId})` : ''}...`);

  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0, 23, 59, 59);

  const donations = await prisma.donation.findMany({
    where: {
      donatedAt: { gte: startDate, lte: endDate },
      ...(branchId && { fund: { branchId } }),
    },
    include: {
      fund: true,
      payment: true,
    },
  });

  const totalAmount = donations.reduce((sum, d) => sum + (d.payment?.amountMinor || 0), 0);
  
  const byFund = donations.reduce((acc, d) => {
    const fundName = d.fund.name;
    acc[fundName] = (acc[fundName] || 0) + (d.payment?.amountMinor || 0);
    return acc;
  }, {} as Record<string, number>);

  const report = {
    period: month,
    branchId: branchId || 'ALL',
    generatedAt: new Date().toISOString(),
    summary: {
      totalDonations: donations.length,
      totalAmountMinor: totalAmount,
      totalAmountFormatted: `$${(totalAmount / 100).toFixed(2)}`,
    },
    byFund,
    transactionIds: donations.map(d => d.id),
  };

  console.log(`[Worker] Finance Report Generated:`, JSON.stringify(report, null, 2));
  
  return;
}

function getProviderForChannel(channel: string): string {
  const providers: Record<string, string> = {
    EMAIL: 'sendgrid',
    SMS: 'twilio',
    WHATSAPP: 'twilio',
    PUSH: 'firebase',
  };
  return providers[channel] || 'unknown';
}

const worker = new Worker(
  'platform-job-queue',
  async (job: Job<JobData>) => {
    const { type, payload } = job.data;
    
    console.log(`[Worker] Started processing job ${job.id} (type: ${type})`);

    switch (type) {
      case 'SEND_CAMPAIGN':
        await sendCampaign(payload.id);
        break;
        
      case 'GENERATE_FINANCE_REPORT':
        await generateFinanceReport(payload.month, payload.branchId);
        break;

      default:
        console.warn(`[Worker] Unknown job type: ${type}`);
        throw new Error(`Unknown job type: ${type}`);
    }

    console.log(`[Worker] Completed job ${job.id}`);
  },
  { 
    connection: connection as any,
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  if (job?.data.type === 'SEND_CAMPAIGN') {
    prisma.campaign.update({
      where: { id: job.data.payload.id },
      data: { status: 'DRAFT' },
    }).catch(console.error);
  }
});

worker.on('error', (err) => {
  console.error('[Worker] Worker error:', err);
});

process.on('SIGTERM', async () => {
  console.log('[Worker] Received SIGTERM, shutting down gracefully...');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Worker] Received SIGINT, shutting down gracefully...');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

console.log('--- PLATFORM WORKER STARTED ---');
console.log(`[Worker] Listening on queue: platform-job-queue`);
console.log(`[Worker] Redis: ${process.env.REDIS_URL || 'redis://localhost:6379'}`);
