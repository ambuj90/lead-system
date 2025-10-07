import { logError } from "../utils/logger.js";
import {
  AppError,
  ValidationError,
  DatabaseError,
  ExternalAPIError,
  NotFoundError,
} from "../utils/errorTypes.js";

// =============================================
// Error Handler Middleware
// Centralized error handling for all routes
// =============================================

/**
 * Main error handler
 */
export function errorHandler(err, req, res, next) {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log the error
  logError(err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Development vs Production error response
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else {
    sendErrorProd(err, req, res);
  }
}

/**
 * Send detailed error in development
 */
function sendErrorDev(err, req, res) {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    timestamp: err.timestamp || new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    ...(err.errors && { errors: err.errors }),
    ...(err.originalError && { originalError: err.originalError.message }),
  });
}

/**
 * Send user-friendly error in production
 */
function sendErrorProd(err, req, res) {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const response = {
      status: err.status,
      message: err.message,
      timestamp: err.timestamp || new Date().toISOString(),
    };

    // Add validation errors if present
    if (err instanceof ValidationError && err.errors) {
      response.errors = err.errors;
    }

    // Add service info for external API errors
    if (err instanceof ExternalAPIError) {
      response.service = err.service;
    }

    res.status(err.statusCode).json(response);
  } else {
    // Programming or unknown error: don't leak error details
    console.error("💥 CRITICAL ERROR:", err);

    res.status(500).json({
      status: "error",
      message: "Something went wrong. Please try again later.",
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Handle 404 - Route not found
 */
export function notFoundHandler(req, res, next) {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Handle uncaught exceptions
 */
export function handleUncaughtException() {
  process.on("uncaughtException", (err) => {
    console.error("💥 UNCAUGHT EXCEPTION! Shutting down...");
    console.error(err.name, err.message);
    logError(err, { type: "uncaughtException" });
    process.exit(1);
  });
}

/**
 * Handle unhandled promise rejections
 */
export function handleUnhandledRejection() {
  process.on("unhandledRejection", (err) => {
    console.error("💥 UNHANDLED REJECTION! Shutting down...");
    console.error(err.name, err.message);
    logError(err, { type: "unhandledRejection" });
    process.exit(1);
  });
}

/**
 * Handle specific error types
 */
export function handleSpecificErrors(err, req, res, next) {
  // MySQL errors
  if (err.code && err.code.startsWith("ER_")) {
    return next(new DatabaseError(translateMySQLError(err), err));
  }

  // Axios errors (vendor API failures)
  if (err.isAxiosError) {
    const vendor = err.config?.url?.includes("itmedia")
      ? "ITMedia"
      : "LeadsMarket";
    return next(
      new ExternalAPIError(
        vendor,
        err.response?.data?.message || err.message,
        err.response?.data
      )
    );
  }

  // JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return next(new ValidationError("Invalid JSON in request body"));
  }

  // Pass to next error handler
  next(err);
}

/**
 * Translate MySQL error codes to user-friendly messages
 */
function translateMySQLError(mysqlError) {
  const errorMap = {
    ER_DUP_ENTRY: "This record already exists",
    ER_NO_REFERENCED_ROW: "Referenced record not found",
    ER_ROW_IS_REFERENCED: "Cannot delete record - it is being used",
    ER_BAD_NULL_ERROR: "Required field is missing",
    ER_ACCESS_DENIED_ERROR: "Database access denied",
    ER_NO_SUCH_TABLE: "Database table not found",
    ER_BAD_FIELD_ERROR: "Invalid database field",
    ECONNREFUSED: "Cannot connect to database",
    PROTOCOL_CONNECTION_LOST: "Database connection lost",
  };

  return errorMap[mysqlError.code] || "Database operation failed";
}

/**
 * Error response builder
 */
export function buildErrorResponse(error, includeStack = false) {
  const response = {
    status: "error",
    message: error.message,
    timestamp: new Date().toISOString(),
  };

  if (error.statusCode) {
    response.statusCode = error.statusCode;
  }

  if (error.errors) {
    response.errors = error.errors;
  }

  if (includeStack && error.stack) {
    response.stack = error.stack;
  }

  return response;
}
