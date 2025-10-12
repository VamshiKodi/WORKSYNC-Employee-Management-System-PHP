<?php
/**
 * Check if leave_requests table exists
 */

header('Content-Type: application/json');

try {
    $mysqli = new mysqli('localhost', 'root', '', 'ems');
    
    if ($mysqli->connect_errno) {
        echo json_encode([
            'success' => false,
            'error' => 'Database connection failed: ' . $mysqli->connect_error
        ]);
        exit;
    }
    
    // Check if table exists
    $result = $mysqli->query("SHOW TABLES LIKE 'leave_requests'");
    
    if ($result->num_rows > 0) {
        // Table exists, get count
        $countResult = $mysqli->query("SELECT COUNT(*) as count FROM leave_requests");
        $count = $countResult->fetch_assoc()['count'];
        
        echo json_encode([
            'success' => true,
            'table_exists' => true,
            'record_count' => $count,
            'message' => "Table exists with {$count} records"
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'table_exists' => false,
            'message' => 'Table does NOT exist. Please run create-leave-requests-table.php'
        ]);
    }
    
    $mysqli->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
