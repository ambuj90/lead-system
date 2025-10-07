import { logRequest, logResponse } from "../utils/logger.js";

// =============================================
// Request Logger Middleware
// Logs all incoming requests and outgoing responses
// =============================================

/**
 * Log HTTP requests and responses
 */
export function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Log incoming request
  logRequest(req);

  // Store original res.json
  const originalJson = res.json;

  // Override res.json to capture response
  res.json = function (data) {
    const duration = Date.now() - startTime;

    // Log response
    logResponse(req, res, duration);

    // Log response data in debug mode
    if (process.env.LOG_LEVEL === "debug") {
      console.log("Response data:", JSON.stringify(data, null, 2));
    }

    // Call original json method
    return originalJson.call(this, data);
  };

  // Track response finish
  res.on("finish", () => {
    const duration = Date.now() - startTime;

    // Color code based on status
    let emoji = "✅";
    if (res.statusCode >= 500) emoji = "❌";
    else if (res.statusCode >= 400) emoji = "⚠️";
    else if (res.statusCode >= 300) emoji = "🔀";

    console.log(
      `${emoji} ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
}

/**
 * Log request body (for debugging)
 */
export function logRequestBody(req, res, next) {
  if (
    process.env.LOG_LEVEL === "debug" &&
    req.body &&
    Object.keys(req.body).length > 0
  ) {
    console.log(
      "📥 Request Body:",
      JSON.stringify(sanitizeBody(req.body), null, 2)
    );
  }
  next();
}

/**
 * Sanitize sensitive data from logs
 */
function sanitizeBody(body) {
  const sanitized = { ...body };

  // List of sensitive fields to mask
  const sensitiveFields = ["ssn", "password", "apikey", "token", "secret"];

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = "***REDACTED***";
    }
  }

  return sanitized;
}

/**
 * Track API performance metrics
 */
export function performanceLogger(req, res, next) {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    // Warn if request is slow (> 3 seconds)
    if (duration > 3000) {
      console.warn(
        `⚡ SLOW REQUEST: ${req.method} ${req.originalUrl} took ${duration}ms`
      );
    }

    // Track in memory (can be sent to monitoring service)
    trackMetric({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date().toISOString(),
    });
  });

  next();
}

/**
 * In-memory metrics storage
 * (In production, send to monitoring service like DataDog, New Relic, etc.)
 */
const metrics = [];
const MAX_METRICS = 1000;

function trackMetric(metric) {
  metrics.push(metric);

  // Keep only last 1000 metrics
  if (metrics.length > MAX_METRICS) {
    metrics.shift();
  }
}

/**
 * Get metrics summary
 */
export function getMetricsSummary() {
  if (metrics.length === 0) {
    return {
      total: 0,
      avgDuration: 0,
      slowestRequest: null,
    };
  }

  const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
  const avgDuration = totalDuration / metrics.length;
  const slowestRequest = metrics.reduce((max, m) =>
    m.duration > max.duration ? m : max
  );

  return {
    total: metrics.length,
    avgDuration: Math.round(avgDuration),
    slowestRequest: {
      path: slowestRequest.path,
      method: slowestRequest.method,
      duration: slowestRequest.duration,
      timestamp: slowestRequest.timestamp,
    },
    statusCodes: countStatusCodes(),
  };
}

/**
 * Count status codes distribution
 */
function countStatusCodes() {
  const counts = {};

  for (const metric of metrics) {
    const code = metric.statusCode;
    counts[code] = (counts[code] || 0) + 1;
  }

  return counts;
}

/**
 * Reset metrics
 */
export function resetMetrics() {
  metrics.length = 0;
}
