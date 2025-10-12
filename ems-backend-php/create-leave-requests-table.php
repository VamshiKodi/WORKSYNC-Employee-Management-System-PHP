<?php
/**
 * Create Leave Requests Table
 * Run this once by visiting: http://localhost/EMS/ems-backend-php/create-leave-requests-table.php
 */

header('Content-Type: text/html; charset=utf-8');

echo "<html><head><title>Create Leave Requests Table</title>";
echo "<style>
    body { 
        font-family: Arial, sans-serif; 
        padding: 20px; 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
    }
    .container { 
        max-width: 900px; 
        margin: 0 auto; 
        background: white; 
        padding: 30px; 
        border-radius: 10px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    h1 { color: #667eea; margin-bottom: 20px; }
    .success { color: #4caf50; font-weight: bold; padding: 10px; background: #e8f5e9; border-radius: 4px; margin: 10px 0; }
    .error { color: #f44336; font-weight: bold; padding: 10px; background: #ffebee; border-radius: 4px; margin: 10px 0; }
    .info { color: #666; margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; }
</style></head><body>";

echo "<div class='container'>";
echo "<h1>📋 Create Leave Requests Table</h1>";

try {
    $mysqli = new mysqli('localhost', 'root', '', 'ems');
    
    if ($mysqli->connect_errno) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }
    
    echo "<p class='info'>✅ Connected to database successfully</p>";
    
    // Create leave_requests table
    $createTableSQL = "CREATE TABLE IF NOT EXISTS leave_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employeeId VARCHAR(50) NOT NULL,
        employeeName VARCHAR(255) NOT NULL,
        leaveType VARCHAR(50) NOT NULL,
        startDate DATE NOT NULL,
        endDate DATE NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        reviewedBy VARCHAR(50) NULL,
        reviewedAt DATETIME NULL,
        reviewComments TEXT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_employeeId (employeeId),
        INDEX idx_status (status),
        INDEX idx_startDate (startDate)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    if ($mysqli->query($createTableSQL)) {
        echo "<div class='success'>";
        echo "<h3>✅ Leave Requests Table Created Successfully!</h3>";
        echo "<p>Table structure:</p>";
        echo "<ul>";
        echo "<li><strong>id</strong>: Auto-increment primary key</li>";
        echo "<li><strong>employeeId</strong>: Employee ID who requested leave</li>";
        echo "<li><strong>employeeName</strong>: Employee name for display</li>";
        echo "<li><strong>leaveType</strong>: Type of leave (Sick, Vacation, Personal, etc.)</li>";
        echo "<li><strong>startDate</strong>: Leave start date</li>";
        echo "<li><strong>endDate</strong>: Leave end date</li>";
        echo "<li><strong>reason</strong>: Reason for leave</li>";
        echo "<li><strong>status</strong>: pending/approved/rejected</li>";
        echo "<li><strong>reviewedBy</strong>: Admin/HR who reviewed</li>";
        echo "<li><strong>reviewedAt</strong>: Review timestamp</li>";
        echo "<li><strong>reviewComments</strong>: Admin/HR comments</li>";
        echo "<li><strong>createdAt</strong>: Request creation timestamp</li>";
        echo "<li><strong>updatedAt</strong>: Last update timestamp</li>";
        echo "</ul>";
        echo "</div>";
        
        // Insert sample leave requests for testing
        echo "<h3>Adding Sample Leave Requests...</h3>";
        
        $sampleRequests = [
            ['EMP001', 'Admin User', 'Sick Leave', '2024-10-15', '2024-10-17', 'Medical appointment and recovery'],
            ['EMP002', 'Employee User', 'Vacation', '2024-10-20', '2024-10-25', 'Family vacation'],
            ['EMP003', 'HR User', 'Personal', '2024-10-18', '2024-10-19', 'Personal matters']
        ];
        
        $insertStmt = $mysqli->prepare(
            "INSERT INTO leave_requests (employeeId, employeeName, leaveType, startDate, endDate, reason, status) 
             VALUES (?, ?, ?, ?, ?, ?, 'pending')"
        );
        
        $inserted = 0;
        foreach ($sampleRequests as $req) {
            $insertStmt->bind_param("ssssss", $req[0], $req[1], $req[2], $req[3], $req[4], $req[5]);
            if ($insertStmt->execute()) {
                $inserted++;
                echo "<p class='info'>✅ Added sample request: {$req[1]} - {$req[2]} ({$req[3]} to {$req[4]})</p>";
            }
        }
        
        echo "<div class='success'>";
        echo "<p><strong>✅ Added {$inserted} sample leave requests for testing!</strong></p>";
        echo "</div>";
        
    } else {
        throw new Exception("Error creating table: " . $mysqli->error);
    }
    
    // Show current table structure
    echo "<h3>Current Table Structure:</h3>";
    $result = $mysqli->query("DESCRIBE leave_requests");
    if ($result) {
        echo "<pre>";
        echo str_pad("Field", 20) . str_pad("Type", 30) . str_pad("Null", 10) . str_pad("Key", 10) . "Extra\n";
        echo str_repeat("-", 80) . "\n";
        while ($row = $result->fetch_assoc()) {
            echo str_pad($row['Field'], 20) . 
                 str_pad($row['Type'], 30) . 
                 str_pad($row['Null'], 10) . 
                 str_pad($row['Key'], 10) . 
                 $row['Extra'] . "\n";
        }
        echo "</pre>";
    }
    
    echo "<div class='info'>";
    echo "<h3>✅ Setup Complete!</h3>";
    echo "<p>You can now:</p>";
    echo "<ul>";
    echo "<li>Employees can submit leave requests</li>";
    echo "<li>Admin/HR can view all leave requests</li>";
    echo "<li>Admin/HR can approve or reject requests</li>";
    echo "<li>Status updates are tracked with timestamps</li>";
    echo "</ul>";
    echo "<p><strong>Next step:</strong> Delete this file after successful setup.</p>";
    echo "</div>";
    
    $mysqli->close();
    
} catch (Exception $e) {
    echo "<div class='error'>";
    echo "<h3>❌ Error:</h3>";
    echo "<p>" . $e->getMessage() . "</p>";
    echo "</div>";
}

echo "</div></body></html>";
?>
