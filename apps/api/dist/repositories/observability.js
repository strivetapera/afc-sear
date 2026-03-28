"use strict";
/**
 * Observability utility for the AFC SEAR platform.
 * In production, this would integrate with Sentry, Datadog, or OpenTelemetry.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.metrics = exports.logger = void 0;
exports.logger = {
    info: (message, meta) => {
        console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta) : '');
    },
    error: (message, error) => {
        console.error(`[ERROR] ${message}`, error);
        // Sentry.captureException(error);
    },
    warn: (message, meta) => {
        console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta) : '');
    }
};
exports.metrics = {
    increment: (name, tags) => {
        // In production: statsD.increment(name, tags);
        console.debug(`[Metric] ${name} incremented`, tags);
    },
    timing: (name, durationMs, tags) => {
        // In production: statsD.timing(name, durationMs, tags);
        console.debug(`[Metric] ${name} timing: ${durationMs}ms`, tags);
    }
};
//# sourceMappingURL=observability.js.map