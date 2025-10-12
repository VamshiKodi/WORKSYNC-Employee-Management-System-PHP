<?php
// Emergency migration from MySQL to SQLite for EMS
// Use this while fixing MySQL issues

echo "<h1>EMS Database Migration: MySQL to SQLite</h1>";

// SQLite database setup
try {
    $sqlite = new PDO('sqlite:' . __DIR__ . '/ems-backup.db');
    $sqlite->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<p>✅ SQLite database created successfully</p>";
    
    // Create EMS tables in SQLite
    $tables = [
        'employees' => "CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id VARCHAR(50) UNIQUE,
            username VARCHAR(100) UNIQUE,
            email VARCHAR(100),
            full_name VARCHAR(200),
            role VARCHAR(50),
            department VARCHAR(100),
            phone VARCHAR(20),
            address TEXT,
            hire_date DATE,
            salary DECIMAL(10,2),
            status VARCHAR(20) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        
        'activity_log' => "CREATE TABLE IF NOT EXISTS activity_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id VARCHAR(50),
            action VARCHAR(100),
            description TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        
        'leave_requests' => "CREATE TABLE IF NOT EXISTS leave_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id VARCHAR(50),
            leave_type VARCHAR(50),
            start_date DATE,
            end_date DATE,
            reason TEXT,
            status VARCHAR(20) DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        
        'tasks' => "CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id VARCHAR(50),
            title VARCHAR(200),
            description TEXT,
            priority VARCHAR(20),
            status VARCHAR(20) DEFAULT 'pending',
            due_date DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        
        'notifications' => "CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id VARCHAR(50),
            message TEXT,
            type VARCHAR(50),
            is_read BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )"
    ];
    
    foreach ($tables as $tableName => $sql) {
        $sqlite->exec($sql);
        echo "<p>✅ Table '$tableName' created</p>";
    }
    
    // Insert default admin user
    $stmt = $sqlite->prepare("INSERT OR IGNORE INTO employees (employee_id, username, email, full_name, role, department) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute(['EMP001', 'admin', 'admin@company.com', 'System Administrator', 'admin', 'IT']);
    
    $stmt = $sqlite->prepare("INSERT OR IGNORE INTO employees (employee_id, username, email, full_name, role, department) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute(['EMP002', 'hr', 'hr@company.com', 'HR Manager', 'hr', 'Human Resources']);
    
    $stmt = $sqlite->prepare("INSERT OR IGNORE INTO employees (employee_id, username, email, full_name, role, department) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute(['EMP003', 'employee', 'employee@company.com', 'Demo Employee', 'employee', 'General']);
    
    echo "<p>✅ Default users created</p>";
    
    echo "<h2>SQLite Database Ready!</h2>";
    echo "<p><strong>Database file:</strong> " . __DIR__ . '/ems-backup.db</p>';
    echo "<p><strong>Size:</strong> " . round(filesize(__DIR__ . '/ems-backup.db') / 1024, 2) . " KB</p>";
    
    // Show current data
    echo "<h3>Current Employees:</h3>";
    $stmt = $sqlite->query("SELECT * FROM employees");
    $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (!empty($employees)) {
        echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
        echo "<tr><th>ID</th><th>Employee ID</th><th>Username</th><th>Full Name</th><th>Role</th><th>Department</th></tr>";
        foreach ($employees as $emp) {
            echo "<tr>";
            echo "<td>{$emp['id']}</td>";
            echo "<td>{$emp['employee_id']}</td>";
            echo "<td>{$emp['username']}</td>";
            echo "<td>{$emp['full_name']}</td>";
            echo "<td>{$emp['role']}</td>";
            echo "<td>{$emp['department']}</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
    
} catch (PDOException $e) {
    echo "<p>❌ Error: " . $e->getMessage() . "</p>";
}
?>

<style>
body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
h1, h2, h3 { color: #333; }
table { background-color: white; margin: 10px 0; }
th, td { padding: 8px; text-align: left; }
th { background-color: #4CAF50; color: white; }
p { background-color: white; padding: 10px; border-radius: 5px; }
</style>
