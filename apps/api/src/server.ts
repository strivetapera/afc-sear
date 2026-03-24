import { createApp } from './app';

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? '0.0.0.0';

async function main() {
  const app = createApp();

  try {
    await app.listen({ port, host });
    app.log.info(`API service listening on http://${host}:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void main();
