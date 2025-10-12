<?php
/**
 * Create Activity Log Table
 * Run this once by visiting: http://localhost/EMS/ems-backend-php/create-activity-log-table.php
 */

header('Content-Type: text/html; charset=utf-8');

echo "<html><head><title>Create Activity Log Table</title>";
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
echo "<h1>📊 Create Activity Log Table</h1>";

try {
    $mysqli = new mysqli('localhost', 'root', '', 'ems');
    
    if ($mysqli->connect_errno) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }
    
    echo "<p class='info'>✅ Connected to database successfully</p>";
    
    // Create activity_log table
    $createTableSQL = "CREATE TABLE IF NOT EXISTS activity_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(50) NOT NULL,
        username VARCHAR(100) NOT NULL,
        action VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        relatedId INT NULL,
        relatedType VARCHAR(50) NULL,
        ipAddress VARCHAR(45) NULL,
        userAgent TEXT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_userId (userId),
        INDEX idx_action (action),
        INDEX idx_category (category),
        INDEX idx_createdAt (createdAt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    if ($mysqli->query($createTableSQL)) {
        echo "<div class='success'>";
        echo "<h3>✅ Activity Log Table Created Successfully!</h3>";
        echo "<p>Table structure:</p>";
        echo "<ul>";
        echo "<li><strong>id</strong>: Auto-increment primary key</li>";
        echo "<li><strong>userId</strong>: User ID who performed the action</li>";
        echo "<li><strong>username</strong>: Username for display</li>";
        echo "<li><strong>action</strong>: Action performed (login, logout, create, update, delete, etc.)</li>";
        echo "<li><strong>description</strong>: Detailed description of the activity</li>";
        echo "<li><strong>category</strong>: Category (auth, employee, leave, system, etc.)</li>";
        echo "<li><strong>relatedId</strong>: Related record ID</li>";
        echo "<li><strong>relatedType</strong>: Type of related record</li>";
        echo "<li><strong>ipAddress</strong>: User's IP address</li>";
        echo "<li><strong>userAgent</strong>: Browser/device info</li>";
        echo "<li><strong>createdAt</strong>: Timestamp</li>";
        echo "</ul>";
        echo "</div>";
        
        // Insert sample activities
        echo "<h3>Adding Sample Activities...</h3>";
        
        $sampleActivities = [
            ['admin', 'admin', 'login', 'Admin logged into the system', 'auth'],
            ['admin', 'admin', 'create_employee', 'Created new employee: John Doe', 'employee'],
            ['hr', 'hr', 'approve_leave', 'Approved leave request for Employee User', 'leave'],
            ['employee', 'employee', 'submit_leave', 'Submitted leave request for vacation', 'leave'],
            ['admin', 'admin', 'update_employee', 'Updated employee information for Jane Smith', 'employee'],
        ];
        
        $insertStmt = $mysqli->prepare(
            "INSERT INTO activity_log (userId, username, action, description, category) 
             VALUES (?, ?, ?, ?, ?)"
        );
        
        $inserted = 0;
        foreach ($sampleActivities as $activity) {
            $insertStmt->bind_param(
                "sssss",
                $activity[0],
                $activity[1],
                $activity[2],
                $activity[3],
                $activity[4]
            );
            if ($insertStmt->execute()) {
                $inserted++;
                echo "<p class='info'>✅ Added: {$activity[3]}</p>";
            }
        }
        
        echo "<div class='success'>";
        echo "<p><strong>✅ Added {$inserted} sample activities!</strong></p>";
        echo "</div>";
        
    } else {
        throw new Exception("Error creating table: " . $mysqli->error);
    }
    
    // Show current table structure
    echo "<h3>Current Table Structure:</h3>";
    $result = $mysqli->query("DESCRIBE activity_log");
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
    echo "<p>Activities will now be automatically logged when:</p>";
    echo "<ul>";
    echo "<li>User logs in/out</li>";
    echo "<li>Employee is created/updated/deleted</li>";
    echo "<li>Leave request is submitted/approved/rejected</li>";
    echo "<li>Any important system action occurs</li>";
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
