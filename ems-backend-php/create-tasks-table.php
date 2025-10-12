<?php
/**
 * Create Tasks Table
 * Run this once by visiting: http://localhost/EMS/ems-backend-php/create-tasks-table.php
 */

header('Content-Type: text/html; charset=utf-8');

echo "<html><head><title>Create Tasks Table</title>";
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
echo "<h1>📋 Create Tasks Table</h1>";

try {
    $mysqli = new mysqli('localhost', 'root', '', 'ems');
    
    if ($mysqli->connect_errno) {
        throw new Exception("Connection failed: " . $mysqli->connect_error);
    }
    
    echo "<p class='info'>✅ Connected to database successfully</p>";
    
    // Create tasks table
    $createTableSQL = "CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        assignedTo VARCHAR(50) NOT NULL,
        assignedToName VARCHAR(100) NOT NULL,
        assignedBy VARCHAR(50) NOT NULL,
        assignedByName VARCHAR(100) NOT NULL,
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(20) DEFAULT 'todo',
        dueDate DATE NULL,
        completedAt TIMESTAMP NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_assignedTo (assignedTo),
        INDEX idx_assignedBy (assignedBy),
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_dueDate (dueDate)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    if ($mysqli->query($createTableSQL)) {
        echo "<div class='success'>";
        echo "<h3>✅ Tasks Table Created Successfully!</h3>";
        echo "<p>Table structure:</p>";
        echo "<ul>";
        echo "<li><strong>id</strong>: Auto-increment primary key</li>";
        echo "<li><strong>title</strong>: Task title</li>";
        echo "<li><strong>description</strong>: Task description</li>";
        echo "<li><strong>assignedTo</strong>: Employee ID who is assigned</li>";
        echo "<li><strong>assignedToName</strong>: Employee name for display</li>";
        echo "<li><strong>assignedBy</strong>: Admin/HR who assigned</li>";
        echo "<li><strong>assignedByName</strong>: Admin/HR name</li>";
        echo "<li><strong>priority</strong>: low/medium/high</li>";
        echo "<li><strong>status</strong>: todo/in_progress/completed</li>";
        echo "<li><strong>dueDate</strong>: Task due date</li>";
        echo "<li><strong>completedAt</strong>: Completion timestamp</li>";
        echo "<li><strong>createdAt</strong>: Creation timestamp</li>";
        echo "<li><strong>updatedAt</strong>: Last update timestamp</li>";
        echo "</ul>";
        echo "</div>";
        
        // Insert sample tasks
        echo "<h3>Adding Sample Tasks...</h3>";
        
        $sampleTasks = [
            [
                'Complete Q4 Report',
                'Prepare and submit the quarterly financial report',
                'E005',
                'Virat Kohli',
                'admin',
                'Admin User',
                'high',
                'todo',
                date('Y-m-d', strtotime('+7 days'))
            ],
            [
                'Update Employee Database',
                'Review and update employee information in the system',
                'E006',
                'Rohit Sharma',
                'admin',
                'Admin User',
                'medium',
                'in_progress',
                date('Y-m-d', strtotime('+14 days'))
            ],
            [
                'Organize Team Meeting',
                'Schedule and organize monthly team meeting',
                'E005',
                'Virat Kohli',
                'hr',
                'HR Manager',
                'low',
                'todo',
                date('Y-m-d', strtotime('+3 days'))
            ]
        ];
        
        $insertStmt = $mysqli->prepare(
            "INSERT INTO tasks (title, description, assignedTo, assignedToName, assignedBy, assignedByName, priority, status, dueDate) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        
        $inserted = 0;
        foreach ($sampleTasks as $task) {
            $insertStmt->bind_param(
                "sssssssss",
                $task[0], $task[1], $task[2], $task[3], $task[4], $task[5], $task[6], $task[7], $task[8]
            );
            if ($insertStmt->execute()) {
                $inserted++;
                echo "<p class='info'>✅ Added: {$task[0]} (Assigned to: {$task[3]})</p>";
            }
        }
        
        echo "<div class='success'>";
        echo "<p><strong>✅ Added {$inserted} sample tasks!</strong></p>";
        echo "</div>";
        
    } else {
        throw new Exception("Error creating table: " . $mysqli->error);
    }
    
    // Show current table structure
    echo "<h3>Current Table Structure:</h3>";
    $result = $mysqli->query("DESCRIBE tasks");
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
    echo "<p>Task management is now ready!</p>";
    echo "<ul>";
    echo "<li>Admin/HR can create and assign tasks</li>";
    echo "<li>Employees can view and update their tasks</li>";
    echo "<li>Track task status and completion</li>";
    echo "<li>Set priorities and due dates</li>";
    echo "</ul>";
    echo "<p><strong>Next step:</strong> Go to the Tasks page in the application.</p>";
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
