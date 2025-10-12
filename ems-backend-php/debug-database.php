<?php
/**
 * Database Debug & Setup Script
 * This will diagnose and fix database connection issues
 */

header('Content-Type: text/html; charset=utf-8');

echo "<html><head><title>Database Debug</title>";
echo "<style>
    body { 
        font-family: Arial, sans-serif; 
        padding: 20px; 
        background: #f5f5f5;
    }
    .container { 
        max-width: 800px; 
        margin: 0 auto; 
        background: white; 
        padding: 30px; 
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    h1 { color: #667eea; }
    .step { 
        margin: 20px 0; 
        padding: 15px; 
        background: #f9f9f9; 
        border-left: 4px solid #667eea; 
    }
    .success { color: #4caf50; font-weight: bold; }
    .error { color: #f44336; font-weight: bold; }
    .warning { color: #ff9800; font-weight: bold; }
    .info { color: #666; margin: 10px 0; }
    pre { background: #f0f0f0; padding: 10px; overflow-x: auto; }
    .fix-btn {
        background: #4caf50;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        margin: 10px 5px 10px 0;
    }
    .fix-btn:hover { background: #45a049; }
</style></head><body>";

echo "<div class='container'>";
echo "<h1>🔧 Database Debug & Setup</h1>";

// Step 1: Check MySQL Extension
echo "<div class='step'>";
echo "<h2>Step 1: PHP MySQL Extension</h2>";

if (extension_loaded('mysqli')) {
    echo "<p class='success'>✅ MySQLi extension is loaded</p>";
} else {
    echo "<p class='error'>❌ MySQLi extension not loaded</p>";
    echo "<p class='info'>Solution: Enable mysqli extension in php.ini</p>";
    exit;
}
echo "</div>";

// Step 2: Test Basic MySQL Connection
echo "<div class='step'>";
echo "<h2>Step 2: MySQL Server Connection</h2>";

try {
    $mysqli_test = new mysqli('localhost', 'root', '');
    
    if ($mysqli_test->connect_error) {
        echo "<p class='error'>❌ Cannot connect to MySQL server: " . $mysqli_test->connect_error . "</p>";
        echo "<p class='info'>Solutions:</p>";
        echo "<ul>";
        echo "<li>Start MySQL in XAMPP Control Panel</li>";
        echo "<li>Check if MySQL is running on port 3306</li>";
        echo "<li>Verify username 'root' with no password</li>";
        echo "</ul>";
        exit;
    } else {
        echo "<p class='success'>✅ Connected to MySQL server successfully</p>";
        echo "<p class='info'>MySQL Version: " . $mysqli_test->server_info . "</p>";
    }
} catch (Exception $e) {
    echo "<p class='error'>❌ MySQL connection failed: " . $e->getMessage() . "</p>";
    exit;
}
echo "</div>";

// Step 3: Check/Create EMS Database
echo "<div class='step'>";
echo "<h2>Step 3: EMS Database</h2>";

$result = $mysqli_test->query("SHOW DATABASES LIKE 'ems'");

if ($result->num_rows === 0) {
    echo "<p class='warning'>⚠️ Database 'ems' does not exist</p>";
    
    if (isset($_GET['create_db'])) {
        if ($mysqli_test->query("CREATE DATABASE ems")) {
            echo "<p class='success'>✅ Database 'ems' created successfully!</p>";
        } else {
            echo "<p class='error'>❌ Failed to create database: " . $mysqli_test->error . "</p>";
        }
    } else {
        echo "<button class='fix-btn' onclick=\"location.href='?create_db=1'\">Create EMS Database</button>";
    }
} else {
    echo "<p class='success'>✅ Database 'ems' exists</p>";
}
echo "</div>";

// Step 4: Connect to EMS Database
echo "<div class='step'>";
echo "<h2>Step 4: Connect to EMS Database</h2>";

try {
    $mysqli = new mysqli('localhost', 'root', '', 'ems');
    
    if ($mysqli->connect_error) {
        echo "<p class='error'>❌ Cannot connect to EMS database: " . $mysqli->connect_error . "</p>";
        exit;
    } else {
        echo "<p class='success'>✅ Connected to EMS database successfully</p>";
    }
} catch (Exception $e) {
    echo "<p class='error'>❌ EMS database connection failed: " . $e->getMessage() . "</p>";
    exit;
}
echo "</div>";

// Step 5: Check Tables
echo "<div class='step'>";
echo "<h2>Step 5: Database Tables</h2>";

// Check employees table
$result = $mysqli->query("SHOW TABLES LIKE 'employees'");
if ($result->num_rows === 0) {
    echo "<p class='warning'>⚠️ Table 'employees' does not exist</p>";
    
    if (isset($_GET['create_employees'])) {
        $createEmployees = "CREATE TABLE employees (
            id INT AUTO_INCREMENT PRIMARY KEY,
            employeeId VARCHAR(50) UNIQUE NOT NULL,
            firstName VARCHAR(100) NOT NULL,
            lastName VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            phone VARCHAR(20),
            department VARCHAR(100) NOT NULL,
            position VARCHAR(100) NOT NULL,
            hireDate DATE,
            salary DECIMAL(10, 2) DEFAULT 0,
            status VARCHAR(20) DEFAULT 'active',
            address TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        
        if ($mysqli->query($createEmployees)) {
            echo "<p class='success'>✅ Table 'employees' created successfully!</p>";
        } else {
            echo "<p class='error'>❌ Failed to create employees table: " . $mysqli->error . "</p>";
        }
    } else {
        echo "<button class='fix-btn' onclick=\"location.href='?create_employees=1'\">Create Employees Table</button>";
    }
} else {
    echo "<p class='success'>✅ Table 'employees' exists</p>";
    
    // Count records
    $result = $mysqli->query("SELECT COUNT(*) as count FROM employees");
    $row = $result->fetch_assoc();
    echo "<p class='info'>Records in employees table: <strong>{$row['count']}</strong></p>";
}

// Check users table
$result = $mysqli->query("SHOW TABLES LIKE 'users'");
if ($result->num_rows === 0) {
    echo "<p class='warning'>⚠️ Table 'users' does not exist</p>";
    
    if (isset($_GET['create_users'])) {
        $createUsers = "CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'employee',
            employeeId VARCHAR(50) UNIQUE NOT NULL,
            isActive BOOLEAN DEFAULT TRUE,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        
        if ($mysqli->query($createUsers)) {
            echo "<p class='success'>✅ Table 'users' created successfully!</p>";
        } else {
            echo "<p class='error'>❌ Failed to create users table: " . $mysqli->error . "</p>";
        }
    } else {
        echo "<button class='fix-btn' onclick=\"location.href='?create_users=1'\">Create Users Table</button>";
    }
} else {
    echo "<p class='success'>✅ Table 'users' exists</p>";
    
    // Count records
    $result = $mysqli->query("SELECT COUNT(*) as count FROM users");
    $row = $result->fetch_assoc();
    echo "<p class='info'>Records in users table: <strong>{$row['count']}</strong></p>";
}
echo "</div>";

// Step 6: Test Insert
echo "<div class='step'>";
echo "<h2>Step 6: Test Database Insert</h2>";

if (isset($_GET['test_insert'])) {
    $testEmployeeId = 'TEST' . time();
    $testEmail = 'test' . time() . '@example.com';
    
    $stmt = $mysqli->prepare(
        "INSERT INTO employees (employeeId, firstName, lastName, email, department, position) 
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    
    $firstName = "Test";
    $lastName = "User";
    $department = "Testing";
    $position = "Test Position";
    
    $stmt->bind_param("ssssss", $testEmployeeId, $firstName, $lastName, $testEmail, $department, $position);
    
    if ($stmt->execute()) {
        echo "<p class='success'>✅ Test insert successful!</p>";
        echo "<p class='info'>Inserted employee with ID: <strong>$testEmployeeId</strong></p>";
        
        // Clean up test data
        $mysqli->query("DELETE FROM employees WHERE employeeId = '$testEmployeeId'");
        echo "<p class='info'>Test data cleaned up</p>";
    } else {
        echo "<p class='error'>❌ Test insert failed: " . $mysqli->error . "</p>";
    }
} else {
    echo "<button class='fix-btn' onclick=\"location.href='?test_insert=1'\">Test Database Insert</button>";
}
echo "</div>";

// Step 7: API Endpoint Test
echo "<div class='step'>";
echo "<h2>Step 7: API Endpoint Status</h2>";

echo "<p class='info'>Test your API endpoints:</p>";
echo "<ul>";
echo "<li><a href='api/health' target='_blank'>Health Check</a> - Should show database status</li>";
echo "<li><a href='test-employee-api.html' target='_blank'>Employee Test Page</a> - Try adding an employee</li>";
echo "<li><a href='check-database.php' target='_blank'>Database Viewer</a> - See stored data</li>";
echo "</ul>";
echo "</div>";

// Summary
echo "<div class='step'>";
echo "<h2>✅ Summary & Next Steps</h2>";

$allGood = true;

// Check if database exists
$result = $mysqli_test->query("SHOW DATABASES LIKE 'ems'");
if ($result->num_rows === 0) {
    echo "<p class='error'>❌ Database 'ems' missing</p>";
    $allGood = false;
}

// Check if tables exist
$result = $mysqli->query("SHOW TABLES LIKE 'employees'");
if ($result->num_rows === 0) {
    echo "<p class='error'>❌ Table 'employees' missing</p>";
    $allGood = false;
}

$result = $mysqli->query("SHOW TABLES LIKE 'users'");
if ($result->num_rows === 0) {
    echo "<p class='error'>❌ Table 'users' missing</p>";
    $allGood = false;
}

if ($allGood) {
    echo "<p class='success'>🎉 Database setup is complete!</p>";
    echo "<p class='info'><strong>Next steps:</strong></p>";
    echo "<ol>";
    echo "<li>Go to <a href='test-employee-api.html' target='_blank'>test-employee-api.html</a></li>";
    echo "<li>Click 'Login as Admin'</li>";
    echo "<li>Add an employee with username and password</li>";
    echo "<li>Check <a href='check-database.php' target='_blank'>check-database.php</a> to see the data</li>";
    echo "</ol>";
} else {
    echo "<p class='warning'>⚠️ Please fix the issues above first</p>";
}

echo "</div>";

echo "</div>";
echo "</body></html>";

$mysqli_test->close();
if (isset($mysqli)) {
    $mysqli->close();
}
?>
