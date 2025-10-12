<?php
header('Content-Type: application/json');

try {
    $mysqli = new mysqli('localhost', 'root', '', 'ems');
    
    if ($mysqli->connect_errno) {
        echo json_encode(['error' => 'Database connection failed: ' . $mysqli->connect_error]);
        exit;
    }
    
    // Check if table exists
    $result = $mysqli->query("SHOW TABLES LIKE 'activity_log'");
    
    if ($result->num_rows > 0) {
        // Table exists, get count
        $countResult = $mysqli->query("SELECT COUNT(*) as count FROM activity_log");
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
            'message' => 'Table does NOT exist. Please run create-activity-log-table.php',
            'setup_url' => 'http://localhost/EMS/ems-backend-php/create-activity-log-table.php'
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
