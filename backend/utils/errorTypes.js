// =============================================
// Custom Error Types
// Provides better error categorization and handling
// =============================================

/**
 * Base Application Error
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error (400)
 * For invalid user input
 */
class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, true);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

/**
 * Authentication Error (401)
 * For authentication failures
 */
class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401, true);
    this.name = "AuthenticationError";
  }
}

/**
 * Authorization Error (403)
 * For authorization/permission issues
 */
class AuthorizationError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403, true);
    this.name = "AuthorizationError";
  }
}

/**
 * Not Found Error (404)
 * For resources that don't exist
 */
class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, true);
    this.name = "NotFoundError";
  }
}

/**
 * Database Error (500)
 * For database operation failures
 */
class DatabaseError extends AppError {
  constructor(message = "Database operation failed", originalError = null) {
    super(message, 500, true);
    this.name = "DatabaseError";
    this.originalError = originalError;
  }
}

/**
 * External API Error (502)
 * For third-party API failures (vendors)
 */
class ExternalAPIError extends AppError {
  constructor(service, message = "External service error", response = null) {
    super(`${service}: ${message}`, 502, true);
    this.name = "ExternalAPIError";
    this.service = service;
    this.response = response;
  }
}

/**
 * Rate Limit Error (429)
 * For rate limit exceeded
 */
class RateLimitError extends AppError {
  constructor(message = "Too many requests, please try again later") {
    super(message, 429, true);
    this.name = "RateLimitError";
  }
}

/**
 * Configuration Error (500)
 * For missing or invalid configuration
 */
class ConfigurationError extends AppError {
  constructor(message = "Configuration error") {
    super(message, 500, false);
    this.name = "ConfigurationError";
  }
}

// =============================================
// Error Factory Functions
// =============================================

/**
 * Create validation error from validation result
 */
export function createValidationError(validationResult) {
  const errors = validationResult.errors.map((err) => ({
    field: err.field || "unknown",
    message: err.message || "Validation failed",
  }));

  return new ValidationError("Validation failed", errors);
}

/**
 * Create database error from MySQL error
 */
export function createDatabaseError(mysqlError) {
  let message = "Database operation failed";

  if (mysqlError.code === "ER_DUP_ENTRY") {
    message = "Duplicate entry detected";
  } else if (mysqlError.code === "ER_NO_REFERENCED_ROW") {
    message = "Referenced record not found";
  } else if (mysqlError.code === "ER_ACCESS_DENIED_ERROR") {
    message = "Database access denied";
  }

  return new DatabaseError(message, mysqlError);
}

/**
 * Create external API error from vendor response
 */
export function createVendorError(vendorName, response) {
  const message = response.Message || response.message || "Vendor API error";
  return new ExternalAPIError(vendorName, message, response);
}

// =============================================
// Export all error types
// =============================================
export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  ExternalAPIError,
  RateLimitError,
  ConfigurationError,
};
