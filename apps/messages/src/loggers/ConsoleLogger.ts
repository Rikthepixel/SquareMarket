import BaseLogger from './BaseLogger';

export default class ConsoleLogger implements BaseLogger {
  info(...loggables: unknown[]): void {
    console.log(...loggables);
  }

  warn(...loggables: unknown[]): void {
    console.warn(...loggables);
  }

  error(...loggables: unknown[]): void {
    console.error(...loggables);
  }
}
