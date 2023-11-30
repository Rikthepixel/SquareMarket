export default interface BaseLogger {
  info(...loggables: unknown[]): void | Promise<void>;
  warn(...loggables: unknown[]): void | Promise<void>;
  error(...loggables: unknown[]): void | Promise<void>;
}
