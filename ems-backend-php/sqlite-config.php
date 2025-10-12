<?php
// Temporary SQLite configuration for EMS
// Use this while fixing MySQL issues

try {
    $pdo = new PDO('sqlite:' . __DIR__ . '/ems.db');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create employees table if not exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id VARCHAR(50) UNIQUE,
        username VARCHAR(100) UNIQUE,
        email VARCHAR(100),
        full_name VARCHAR(200),
        role VARCHAR(50),
        department VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Insert default admin user if not exists
    $stmt = $pdo->prepare("INSERT OR IGNORE INTO employees (employee_id, username, email, full_name, role) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute(['EMP001', 'admin', 'admin@company.com', 'System Administrator', 'admin']);
    
    echo "SQLite database ready! File: " . __DIR__ . '/ems.db';
    
} catch (PDOException $e) {
    echo "SQLite Error: " . $e->getMessage();
}
?>
