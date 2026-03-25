/**
 * Observability utility for the AFC SEAR platform.
 * In production, this would integrate with Sentry, Datadog, or OpenTelemetry.
 */

export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
    // Sentry.captureException(error);
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta) : '');
  }
};

export const metrics = {
  increment: (name: string, tags?: Record<string, string>) => {
    // In production: statsD.increment(name, tags);
    console.debug(`[Metric] ${name} incremented`, tags);
  },
  timing: (name: string, durationMs: number, tags?: Record<string, string>) => {
    // In production: statsD.timing(name, durationMs, tags);
    console.debug(`[Metric] ${name} timing: ${durationMs}ms`, tags);
  }
};
