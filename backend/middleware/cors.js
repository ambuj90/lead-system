/**
 * CORS Middleware for Express
 * Handles Cross-Origin Resource Sharing
 */

const allowedOrigins = [
  "https://lead-system-1.onrender.com",
  "https://lead-system-8iga.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
];

const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;

  // Log CORS request
  console.log(`[CORS] Request from origin: ${origin}`);

  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    console.log(`[CORS] ✓ Origin allowed: ${origin}`);
  } else {
    console.log(`[CORS] ✗ Origin rejected: ${origin}`);
  }

  // Set CORS headers
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept"
  );
  res.setHeader("Access-Control-Max-Age", "86400");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    console.log("[CORS] Handling preflight request");
    res.status(204).end();
    return;
  }

  next();
};

module.exports = corsMiddleware;
