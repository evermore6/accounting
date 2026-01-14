// Logger utility for structured logging

interface LogEntry {
  timestamp: Date;
  level: string;
  message: string;
  metadata?: Record<string, any>;
}

class Logger {
  private logLevel: string;

  constructor(level: string = 'info') {
    this.logLevel = level;
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatLog(level: string, message: string, metadata?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date(),
      level: level.toUpperCase(),
      message,
      metadata,
    };
  }

  private output(logEntry: LogEntry): void {
    const logString = JSON.stringify(logEntry);
    
    if (logEntry.level === 'ERROR') {
      console.error(logString);
    } else if (logEntry.level === 'WARN') {
      console.warn(logString);
    } else {
      console.log(logString);
    }
  }

  debug(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      this.output(this.formatLog('debug', message, metadata));
    }
  }

  info(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      this.output(this.formatLog('info', message, metadata));
    }
  }

  warn(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      this.output(this.formatLog('warn', message, metadata));
    }
  }

  error(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('error')) {
      this.output(this.formatLog('error', message, metadata));
    }
  }
}

// Create singleton instance
const logger = new Logger(process.env.LOG_LEVEL || 'info');

export default logger;
