<?php
/**
 * Lead Submission API Endpoint
 * Handles lead form submissions and posts to vendors
 */

// Include CORS configuration FIRST - before any output
require_once __DIR__ . '/../config/cors.php';

// Then include other files
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/vendor-poster.php';

// Set error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors to client
ini_set('log_errors', 1);

// Log function for debugging
function logDebug($message) {
    error_log('[LEAD API] ' . $message);
}

try {
    // Only accept POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'error' => 'Method not allowed. Use POST.'
        ]);
        exit;
    }

    // Get JSON input
    $input = file_get_contents('php://input');
    logDebug('Raw input: ' . substr($input, 0, 200)); // Log first 200 chars
    
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid JSON: ' . json_last_error_msg()
        ]);
        exit;
    }

    // Validate required fields
    $required_fields = [
        'fName', 'lName', 'email', 'phone', 'address1', 'city', 'state', 'zip',
        'bMonth', 'bDay', 'bYear', 'amount', 'ssn', 'incomeSource', 
        'monthlyNetIncome', 'lengthAtAddress', 'rentOwn', 'callTime'
    ];

    $missing_fields = [];
    foreach ($required_fields as $field) {
        if (empty($data[$field]) && $data[$field] !== '0') {
            $missing_fields[] = $field;
        }
    }

    if (!empty($missing_fields)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Missing required fields',
            'missing_fields' => $missing_fields
        ]);
        exit;
    }

    // Validate email format
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid email format'
        ]);
        exit;
    }

    // Validate phone (must be 10 digits)
    if (!preg_match('/^\d{10}$/', $data['phone'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Phone must be 10 digits'
        ]);
        exit;
    }

    // Validate SSN (must be 9 digits)
    if (!preg_match('/^\d{9}$/', $data['ssn'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'SSN must be 9 digits'
        ]);
        exit;
    }

    // Validate age (must be 18+)
    $birthDate = new DateTime($data['bYear'] . '-' . $data['bMonth'] . '-' . $data['bDay']);
    $today = new DateTime();
    $age = $today->diff($birthDate)->y;
    
    if ($age < 18) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Must be 18 years or older'
        ]);
        exit;
    }

    // Connect to database
    $db = getDbConnection();
    
    // Start transaction
    $db->begin_transaction();

    try {
        // Insert lead into database
        $stmt = $db->prepare("
            INSERT INTO leads (
                fName, lName, email, phone, address1, city, state, zip,
                bMonth, bDay, bYear, amount, ssn, incomeSource, monthlyNetIncome,
                lengthAtAddress, rentOwn, callTime, loan_reason, credit_type,
                ip_address, user_agent, note, atrk, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");

        $stmt->bind_param(
            "ssssssssiiissssisssssss",
            $data['fName'],
            $data['lName'],
            $data['email'],
            $data['phone'],
            $data['address1'],
            $data['city'],
            $data['state'],
            $data['zip'],
            $data['bMonth'],
            $data['bDay'],
            $data['bYear'],
            $data['amount'],
            $data['ssn'],
            $data['incomeSource'],
            $data['monthlyNetIncome'],
            $data['lengthAtAddress'],
            $data['rentOwn'],
            $data['callTime'],
            $data['loan_reason'] ?? '',
            $data['credit_type'] ?? '',
            $data['ip_address'] ?? $_SERVER['REMOTE_ADDR'],
            $data['user_agent'] ?? $_SERVER['HTTP_USER_AGENT'],
            $data['note'] ?? 'web-form',
            $data['atrk'] ?? ''
        );

        if (!$stmt->execute()) {
            throw new Exception('Database insert failed: ' . $stmt->error);
        }

        $lead_id = $db->insert_id;
        logDebug("Lead saved with ID: $lead_id");

        // Post to vendors
        $vendorPoster = new VendorPoster($db);
        $result = $vendorPoster->postLead($lead_id, $data);

        // Commit transaction
        $db->commit();

        // Return response
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'lead_id' => $lead_id,
            'status' => $result['status'],
            'redirect_url' => $result['redirect_url'] ?? null,
            'price' => $result['price'] ?? null,
            'vendor' => $result['vendor'] ?? null
        ]);

    } catch (Exception $e) {
        // Rollback on error
        $db->rollback();
        throw $e;
    }

} catch (Exception $e) {
    logDebug('Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>