// Error handling utilities for consistent error management

export interface ErrorDetails {
  message: string;
  code?: string | undefined;
  status?: number | undefined;
  timestamp: Date;
}

export class AppError extends Error {
  public readonly code?: string | undefined;
  public readonly status?: number | undefined;
  public readonly timestamp: Date;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = "AppError";
    this.code = code ?? undefined;
    this.status = status ?? undefined;
    this.timestamp = new Date();
  }
}

export function createErrorFromUnknown(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message);
  }

  if (typeof error === "string") {
    return new AppError(error);
  }

  return new AppError("An unknown error occurred");
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.code === "NETWORK_ERROR" || error.status === 0;
  }

  if (error instanceof Error) {
    return error.message.includes("fetch") || 
           error.message.includes("network") ||
           error.message.includes("Failed to fetch");
  }

  return false;
}

export function isServerError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.status ? error.status >= 500 : false;
  }

  return false;
}

export function isClientError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.status ? error.status >= 400 && error.status < 500 : false;
  }

  return false;
}

export function getErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return "Network error. Please check your internet connection and try again.";
  }

  if (isServerError(error)) {
    return "Server error. Please try again later.";
  }

  if (isClientError(error)) {
    return "Invalid request. Please check your input and try again.";
  }

  const appError = createErrorFromUnknown(error);
  return appError.message;
}

export function logError(error: unknown, context?: string): void {
  const errorDetails: ErrorDetails = {
    message: getErrorMessage(error),
    timestamp: new Date(),
  };

  if (error instanceof AppError) {
    errorDetails.code = error.code;
    errorDetails.status = error.status;
  }

  console.error(`[${context || "Application"}] Error:`, {
    ...errorDetails,
    originalError: error,
  });
} 