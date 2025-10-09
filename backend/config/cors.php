<?php
/**
 * CORS Configuration for Lead System
 * Add this at the very top of your API endpoint file
 */

// Define allowed origins (without trailing slashes)
$allowed_origins = [
    'https://lead-system-1.onrender.com',
    'https://lead-system-sb8k.onrender.com',
    'https://lead-system-8iga.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000'
];

// Get the origin of the request (remove trailing slash if present)
$origin = isset($_SERVER['HTTP_ORIGIN']) ? rtrim($_SERVER['HTTP_ORIGIN'], '/') : '';

// Log for debugging
error_log("CORS - Request Origin: " . $origin);

// Check if the origin is allowed
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    error_log("CORS - Origin Allowed: $origin");
} else {
    // Log rejected origin for debugging
    error_log("CORS - Origin Rejected: $origin");
    // For production, be strict - don't allow unknown origins
    // Uncomment this for development only:
    // header("Access-Control-Allow-Origin: *");
}

// Set other CORS headers
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400"); // Cache preflight for 24 hours

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // No Content
    exit();
}

// Set content type for JSON responses
header('Content-Type: application/json; charset=UTF-8');
?>