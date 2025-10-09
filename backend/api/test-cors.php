<?php
/**
 * CORS Test Endpoint
 * Use this to verify CORS is configured correctly
 */

// Include CORS configuration
require_once __DIR__ . '/../config/cors.php';

// Return test response
echo json_encode([
    'success' => true,
    'message' => 'CORS is working correctly!',
    'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'No origin header',
    'method' => $_SERVER['REQUEST_METHOD'],
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [
        'php_version' => PHP_VERSION,
        'request_uri' => $_SERVER['REQUEST_URI'],
        'remote_addr' => $_SERVER['REMOTE_ADDR']
    ]
]);
?>