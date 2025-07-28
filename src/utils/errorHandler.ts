export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

export class ScrapingError extends AppError {
  constructor(message: string, site?: string) {
    super(message, 503, 'SCRAPING_ERROR');
    this.name = 'ScrapingError';
  }
}

export const handleError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, 500, 'UNKNOWN_ERROR');
  }
  
  return new AppError('An unknown error occurred', 500, 'UNKNOWN_ERROR');
};

export const logError = (error: AppError, context?: Record<string, any>) => {
  console.error(`[${error.code}] ${error.message}`, {
    statusCode: error.statusCode,
    stack: error.stack,
    context
  });
};