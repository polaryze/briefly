type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    
    // In production, only log warnings and errors
    return level === 'warn' || level === 'error';
  }

  debug(message: string, context?: Record<string, any>) {
    if (this.shouldLog('debug')) {
      const entry = this.formatMessage('debug', message, context);
      console.debug(`[DEBUG] ${entry.message}`, entry.context || '');
    }
  }

  info(message: string, context?: Record<string, any>) {
    if (this.shouldLog('info')) {
      const entry = this.formatMessage('info', message, context);
      console.info(`[INFO] ${entry.message}`, entry.context || '');
    }
  }

  warn(message: string, context?: Record<string, any>) {
    if (this.shouldLog('warn')) {
      const entry = this.formatMessage('warn', message, context);
      console.warn(`[WARN] ${entry.message}`, entry.context || '');
    }
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    if (this.shouldLog('error')) {
      const entry = this.formatMessage('error', message, {
        ...context,
        error: error?.message,
        stack: error?.stack
      });
      console.error(`[ERROR] ${entry.message}`, entry.context || '');
    }
  }
}

export const logger = new Logger(); 