/**
 * Utility for consistent logging across the application
 */

// Log levels
const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

// Flag to control debug logging
const SHOW_DEBUG = process.env.NODE_ENV !== 'production';

/**
 * General logger function that handles different log levels
 */
export function log(level: string, context: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${context}]`;
  
  // Include data if available
  const logData = data !== undefined ? ` ${typeof data === 'object' ? JSON.stringify(data) : data}` : '';
  
  // Skip debug logs in production
  if (level === LOG_LEVELS.DEBUG && !SHOW_DEBUG) {
    return;
  }
  
  switch (level) {
    case LOG_LEVELS.DEBUG:
      console.debug(`${prefix} ${message}${logData}`);
      break;
    case LOG_LEVELS.INFO:
      console.info(`${prefix} ${message}${logData}`);
      break;
    case LOG_LEVELS.WARN:
      console.warn(`${prefix} ${message}${logData}`);
      break;
    case LOG_LEVELS.ERROR:
      console.error(`${prefix} ${message}${logData}`);
      break;
    default:
      console.log(`${prefix} ${message}${logData}`);
  }
}

/**
 * Convenience methods for specific log levels
 */
export const logger = {
  debug: (context: string, message: string, data?: any) => log(LOG_LEVELS.DEBUG, context, message, data),
  info: (context: string, message: string, data?: any) => log(LOG_LEVELS.INFO, context, message, data),
  warn: (context: string, message: string, data?: any) => log(LOG_LEVELS.WARN, context, message, data),
  error: (context: string, message: string, data?: any) => log(LOG_LEVELS.ERROR, context, message, data),
};

/**
 * Log an error with stack trace and additional context
 */
export function logError(context: string, error: unknown, additionalInfo?: any) {
  if (error instanceof Error) {
    logger.error(context, `${error.name}: ${error.message}`, {
      stack: error.stack,
      ...(additionalInfo || {}),
    });
  } else {
    logger.error(context, 'Unknown error', {
      error,
      ...(additionalInfo || {}),
    });
  }
}

/**
 * Safe JSON parse that won't throw
 */
export function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch (error) {
    logError('JsonParse', error, { text: text.substring(0, 100) });
    return null;
  }
}

export default logger; 