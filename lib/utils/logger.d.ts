import type { LogLevel } from '../types';
export declare const logger: import("pino").Logger<never>;
/**
 * Creates a logger instance with optional redaction of PII.
 * See PII_PROPERTIES for the list of properties that will be redacted.
 *
 * @param redactPii - whether to redact PII from logs
 * @param level - the log level to use
 * @param onLog - a callback to call when a log is written
 */
export declare function makeLogger(redactPii: boolean, level?: LogLevel, onLog?: (level: LogLevel, log: any) => void): import("pino").Logger<never>;
export declare function redact(json: any): any;
