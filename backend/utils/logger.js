import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================================
// Log Levels
// =============================================
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// =============================================
// Log Colors
// =============================================
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(colors);

// =============================================
// Log Format
// =============================================
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format with colors
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    let metaStr = "";

    if (Object.keys(meta).length > 0) {
      metaStr = "\n" + JSON.stringify(meta, null, 2);
    }

    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// =============================================
// Create logs directory
// =============================================
const logsDir = path.join(__dirname, "../logs");

// =============================================
// Transport: Console
// =============================================
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
});

// =============================================
// Transport: Error Log File (Daily Rotation)
// =============================================
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  level: "error",
  format: logFormat,
  maxSize: "20m",
  maxFiles: "14d",
  zippedArchive: true,
});

// =============================================
// Transport: Combined Log File (Daily Rotation)
// =============================================
const combinedFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, "combined-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  format: logFormat,
  maxSize: "20m",
  maxFiles: "14d",
  zippedArchive: true,
});

// =============================================
// Transport: HTTP Access Log (Daily Rotation)
// =============================================
const httpFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, "access-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  level: "http",
  format: logFormat,
  maxSize: "20m",
  maxFiles: "14d",
  zippedArchive: true,
});

// =============================================
// Create Winston Logger
// =============================================
const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  transports: [
    consoleTransport,
    errorFileTransport,
    combinedFileTransport,
    httpFileTransport,
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, "exceptions-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, "rejections-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

// =============================================
// Helper Functions
// =============================================

/**
 * Log API request
 */
export function logRequest(req, duration = 0) {
  logger.http("API Request", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    duration: `${duration}ms`,
  });
}

/**
 * Log API response
 */
export function logResponse(req, res, duration) {
  logger.http("API Response", {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
  });
}

/**
 * Log database query
 */
export function logQuery(sql, params, duration) {
  logger.debug("Database Query", {
    sql: sql.substring(0, 200), // Truncate long queries
    params: params?.length > 0 ? params : "none",
    duration: `${duration}ms`,
  });
}

/**
 * Log vendor API call
 */
export function logVendorCall(vendor, endpoint, status, duration) {
  logger.info("Vendor API Call", {
    vendor,
    endpoint,
    status,
    duration: `${duration}ms`,
  });
}

/**
 * Log lead processing
 */
export function logLeadProcessing(leadId, status, details = {}) {
  logger.info("Lead Processing", {
    leadId,
    status,
    ...details,
  });
}

/**
 * Log error with context
 */
export function logError(error, context = {}) {
  logger.error(error.message, {
    name: error.name,
    statusCode: error.statusCode,
    stack: error.stack,
    isOperational: error.isOperational,
    ...context,
  });
}

/**
 * Log warning
 */
export function logWarning(message, context = {}) {
  logger.warn(message, context);
}

/**
 * Log info
 */
export function logInfo(message, context = {}) {
  logger.info(message, context);
}

/**
 * Log debug
 */
export function logDebug(message, context = {}) {
  logger.debug(message, context);
}

// =============================================
// Export logger instance and helpers
// =============================================
export default logger;
