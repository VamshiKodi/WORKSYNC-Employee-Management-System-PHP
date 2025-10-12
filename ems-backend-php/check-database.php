<?php
/**
 * Quick Database Check - View All Stored Data
 */

header('Content-Type: text/html; charset=utf-8');

echo "<html><head><title>Database Check</title>";
echo "<style>
    body { 
        font-family: 'Segoe UI', Arial, sans-serif; 
        padding: 20px; 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
    }
    .container { 
        max-width: 1200px; 
        margin: 0 auto; 
        background: white; 
        padding: 30px; 
        border-radius: 10px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    h1 { color: #667eea; margin-bottom: 10px; }
    h2 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-top: 30px; }
    .success { color: #4caf50; font-weight: bold; }
    .error { color: #f44336; font-weight: bold; }
    .info { color: #666; margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; }
    table { 
        width: 100%; 
        border-collapse: collapse; 
        margin: 15px 0;
        font-size: 14px;
    }
    th, td { 
        padding: 12px; 
        border: 1px solid #ddd; 
        text-align: left; 
    }
    th { 
        background: #667eea; 
        color: white;
        font-weight: 600;
    }
    tr:nth-child(even) { background: #f9f9f9; }
    tr:hover { background: #f0f0f0; }
    .badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
    }
    .badge-success { background: #4caf50; color: white; }
    .badge-info { background: #2196F3; color: white; }
    .badge-warning { background: #ff9800; color: white; }
    .refresh-btn {
        background: #667eea;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        margin-top: 20px;
    }
    .refresh-btn:hover { background: #5568d3; }
    .password-hash {
        font-family: monospace;
        font-size: 11px;
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style></head><body>";

echo "<div class='container'>";
echo "<h1>🗄️ Database Storage Check</h1>";
echo "<p class='info'>Current Time: " . date('Y-m-d H:i:s') . "</p>";

// Connect to MySQL
$mysqli = new mysqli('localhost', 'root', '', 'ems');

if ($mysqli->connect_error) {
    echo "<p class='error'>❌ Failed to connect to MySQL: " . $mysqli->connect_error . "</p>";
    echo "<p class='info'>💡 Solution: Start MySQL in XAMPP Control Panel</p>";
    echo "</div></body></html>";
    exit;
}

echo "<p class='success'>✅ MySQL Connected Successfully</p>";

// Check Employees Table
echo "<h2>📊 Employees Table</h2>";

$result = $mysqli->query("SHOW TABLES LIKE 'employees'");
if ($result->num_rows === 0) {
    echo "<p class='error'>❌ Employees table doesn't exist yet</p>";
    echo "<p class='info'>💡 Add your first employee to create the table</p>";
} else {
    $result = $mysqli->query("SELECT COUNT(*) as count FROM employees");
    $row = $result->fetch_assoc();
    $employeeCount = $row['count'];
    
    echo "<p class='success'>✅ Table exists with <strong>{$employeeCount} employee(s)</strong></p>";
    
    if ($employeeCount > 0) {
        $result = $mysqli->query("SELECT * FROM employees ORDER BY createdAt DESC");
        
        echo "<table>";
        echo "<tr>
                <th>ID</th>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Position</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Created</th>
              </tr>";
        
        while ($emp = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>{$emp['id']}</td>";
            echo "<td><span class='badge badge-info'>{$emp['employeeId']}</span></td>";
            echo "<td><strong>{$emp['firstName']} {$emp['lastName']}</strong></td>";
            echo "<td>{$emp['email']}</td>";
            echo "<td>{$emp['department']}</td>";
            echo "<td>{$emp['position']}</td>";
            echo "<td>\$" . number_format($emp['salary'], 2) . "</td>";
            echo "<td><span class='badge badge-success'>{$emp['status']}</span></td>";
            echo "<td>" . date('Y-m-d H:i', strtotime($emp['createdAt'])) . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
    } else {
        echo "<p class='info'>💡 No employees added yet. Use the test page to add some!</p>";
    }
}

// Check Users Table
echo "<h2>🔐 Users Table (Login Credentials)</h2>";

$result = $mysqli->query("SHOW TABLES LIKE 'users'");
if ($result->num_rows === 0) {
    echo "<p class='error'>❌ Users table doesn't exist yet</p>";
    echo "<p class='info'>💡 Add an employee with login credentials to create the table</p>";
} else {
    $result = $mysqli->query("SELECT COUNT(*) as count FROM users");
    $row = $result->fetch_assoc();
    $userCount = $row['count'];
    
    echo "<p class='success'>✅ Table exists with <strong>{$userCount} user(s)</strong></p>";
    
    if ($userCount > 0) {
        $result = $mysqli->query("SELECT * FROM users ORDER BY createdAt DESC");
        
        echo "<table>";
        echo "<tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Password Hash</th>
                <th>Role</th>
                <th>Employee ID</th>
                <th>Active</th>
                <th>Created</th>
              </tr>";
        
        while ($user = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>{$user['id']}</td>";
            echo "<td><strong>{$user['username']}</strong></td>";
            echo "<td>{$user['email']}</td>";
            echo "<td><span class='password-hash' title='{$user['password']}'>" . substr($user['password'], 0, 20) . "...</span></td>";
            
            $roleColor = $user['role'] === 'admin' ? 'badge-warning' : ($user['role'] === 'hr' ? 'badge-info' : 'badge-success');
            echo "<td><span class='badge {$roleColor}'>{$user['role']}</span></td>";
            echo "<td><span class='badge badge-info'>{$user['employeeId']}</span></td>";
            echo "<td>" . ($user['isActive'] ? '✅' : '❌') . "</td>";
            echo "<td>" . date('Y-m-d H:i', strtotime($user['createdAt'])) . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
        
        echo "<p class='info'>🔒 Passwords are hashed with bcrypt (starting with \$2y\$10\$)</p>";
    } else {
        echo "<p class='info'>💡 No users added yet. Add an employee with login credentials!</p>";
    }
}

// Summary
echo "<h2>📈 Summary</h2>";
echo "<div class='info'>";
echo "<strong>Database:</strong> ems<br>";
echo "<strong>Employees:</strong> " . (isset($employeeCount) ? $employeeCount : 0) . " records<br>";
echo "<strong>Users:</strong> " . (isset($userCount) ? $userCount : 0) . " accounts<br>";
echo "<strong>Storage:</strong> MySQL (persistent)<br>";
echo "</div>";

echo "<h2>🧪 Test Actions</h2>";
echo "<div class='info'>";
echo "1. <a href='test-employee-api.html' target='_blank'>Open Test Page</a> - Add employees<br>";
echo "2. <a href='http://localhost/phpmyadmin' target='_blank'>Open phpMyAdmin</a> - View in MySQL<br>";
echo "3. <a href='check-database.php'>Refresh This Page</a> - See updates<br>";
echo "</div>";

echo "<button class='refresh-btn' onclick='location.reload()'>🔄 Refresh Data</button>";

echo "</div>";
echo "</body></html>";

$mysqli->close();
?>
