<?php
/**
 * Create Notifications Table
 * Run this once by visiting: http://localhost/EMS/ems-backend-php/create-notifications-table.php
 */

header('Content-Type: text/html; charset=utf-8');

echo "<html><head><title>Create Notifications Table</title>";
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
echo "<h1>🔔 Create Notifications Table</h1>";

try {
    $mysqli = new mysqli('localhost', 'root', '', 'ems');
    
    if ($mysqli->connect_errno) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }
    
    echo "<p class='info'>✅ Connected to database successfully</p>";
    
    // Create notifications table
    $createTableSQL = "CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(50) NULL,
        recipientRole VARCHAR(20) NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'info',
        category VARCHAR(50) DEFAULT 'system',
        sender VARCHAR(100) DEFAULT 'System',
        isRead BOOLEAN DEFAULT FALSE,
        relatedId INT NULL,
        relatedType VARCHAR(50) NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        readAt TIMESTAMP NULL,
        INDEX idx_userId (userId),
        INDEX idx_recipientRole (recipientRole),
        INDEX idx_isRead (isRead),
        INDEX idx_createdAt (createdAt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    if ($mysqli->query($createTableSQL)) {
        echo "<div class='success'>";
        echo "<h3>✅ Notifications Table Created Successfully!</h3>";
        echo "<p>Table structure:</p>";
        echo "<ul>";
        echo "<li><strong>id</strong>: Auto-increment primary key</li>";
        echo "<li><strong>userId</strong>: Specific user ID (NULL for role-based notifications)</li>";
        echo "<li><strong>recipientRole</strong>: Target role (admin/hr/employee, NULL for specific user)</li>";
        echo "<li><strong>title</strong>: Notification title</li>";
        echo "<li><strong>message</strong>: Notification message</li>";
        echo "<li><strong>type</strong>: info/success/warning/error</li>";
        echo "<li><strong>category</strong>: system/hr/payroll/attendance/leave</li>";
        echo "<li><strong>sender</strong>: Who sent the notification</li>";
        echo "<li><strong>isRead</strong>: Read status (0=unread, 1=read)</li>";
        echo "<li><strong>relatedId</strong>: Related record ID (e.g., leave request ID)</li>";
        echo "<li><strong>relatedType</strong>: Type of related record (e.g., 'leave_request')</li>";
        echo "<li><strong>createdAt</strong>: Creation timestamp</li>";
        echo "<li><strong>readAt</strong>: When it was read</li>";
        echo "</ul>";
        echo "</div>";
        
        // Insert sample notifications
        echo "<h3>Adding Sample Notifications...</h3>";
        
        $sampleNotifications = [
            [
                'recipientRole' => 'admin',
                'title' => 'System Maintenance Scheduled',
                'message' => 'Scheduled maintenance on Sunday from 2:00 AM - 4:00 AM. System will be temporarily unavailable.',
                'type' => 'warning',
                'category' => 'system',
                'sender' => 'System Admin'
            ],
            [
                'recipientRole' => 'hr',
                'title' => 'New Employee Onboarding',
                'message' => 'Please review and approve access permissions for new employees.',
                'type' => 'info',
                'category' => 'hr',
                'sender' => 'HR Department'
            ]
        ];
        
        $insertStmt = $mysqli->prepare(
            "INSERT INTO notifications (recipientRole, title, message, type, category, sender) 
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        
        $inserted = 0;
        foreach ($sampleNotifications as $notif) {
            $insertStmt->bind_param(
                "ssssss",
                $notif['recipientRole'],
                $notif['title'],
                $notif['message'],
                $notif['type'],
                $notif['category'],
                $notif['sender']
            );
            if ($insertStmt->execute()) {
                $inserted++;
                echo "<p class='info'>✅ Added: {$notif['title']}</p>";
            }
        }
        
        echo "<div class='success'>";
        echo "<p><strong>✅ Added {$inserted} sample notifications!</strong></p>";
        echo "</div>";
        
    } else {
        throw new Exception("Error creating table: " . $mysqli->error);
    }
    
    // Show current table structure
    echo "<h3>Current Table Structure:</h3>";
    $result = $mysqli->query("DESCRIBE notifications");
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
    echo "<p>Notifications will now be automatically created when:</p>";
    echo "<ul>";
    echo "<li>Employee submits a leave request → Notifies Admin/HR</li>";
    echo "<li>Leave request is approved → Notifies Employee</li>";
    echo "<li>Leave request is rejected → Notifies Employee</li>";
    echo "<li>New employee is added → Notifies Admin/HR</li>";
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
