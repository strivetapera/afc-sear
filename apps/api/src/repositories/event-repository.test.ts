import { expect, test, describe, vi, beforeEach } from 'vitest';
import * as EventRepository from './event-repository';
import { getPrismaClient } from './prisma';

// Helper to get mocked prisma
const prisma = getPrismaClient() as any;

describe('EventRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listPublicEvents', () => {
    test('calls prisma.event.findMany with correct filter', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      
      await EventRepository.listPublicEvents();
      
      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: 'PUBLISHED',
            visibility: 'PUBLIC'
          }
        })
      );
    });

    test('maps database events to detail views', async () => {
      const mockEvent = {
        id: '1',
        title: 'Test Event',
        slug: 'test-event',
        summary: 'Summary',
        description: {},
        eventType: 'CONFERENCE',
        registrationMode: 'OPEN',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        venue: { name: 'Venue', city: 'City' },
        schedules: [],
        ticketTypes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      prisma.event.findMany.mockResolvedValue([mockEvent]);
      
      const result = await EventRepository.listPublicEvents();
      
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Event');
      expect(result[0].venue.name).toBe('Venue');
    });
  });
});
