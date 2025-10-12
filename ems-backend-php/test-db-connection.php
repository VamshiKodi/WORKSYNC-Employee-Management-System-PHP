<?php
/**
 * Test Database Connection - Debug MySQL Issues
 */

header('Content-Type: text/html; charset=utf-8');

echo "<html><head><title>Database Connection Test</title>";
echo "<style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
    h1 { color: #667eea; }
    .success { color: #4caf50; font-weight: bold; }
    .error { color: #f44336; font-weight: bold; }
    .warning { color: #ff9800; font-weight: bold; }
    .info { color: #666; margin: 10px 0; background: #f9f9f9; padding: 10px; border-radius: 4px; }
    pre { background: #f0f0f0; padding: 10px; overflow-x: auto; }
</style></head><body>";

echo "<div class='container'>";
echo "<h1>🔍 Database Connection Debug</h1>";

// Test 1: Check MySQL Extension
echo "<h2>1. PHP MySQL Extension</h2>";
if (extension_loaded('mysqli')) {
    echo "<p class='success'>✅ MySQLi extension loaded</p>";
} else {
    echo "<p class='error'>❌ MySQLi extension not loaded</p>";
    exit;
}

// Test 2: Basic MySQL Connection
echo "<h2>2. Basic MySQL Connection</h2>";
echo "<div class='info'>";
echo "<strong>Attempting to connect to:</strong><br>";
echo "Host: localhost<br>";
echo "Username: root<br>";
echo "Password: (empty)<br>";
echo "</div>";

try {
    $mysqli_test = new mysqli('localhost', 'root', '');
    
    if ($mysqli_test->connect_error) {
        echo "<p class='error'>❌ Connection failed: " . $mysqli_test->connect_error . "</p>";
        echo "<p class='info'><strong>Common solutions:</strong></p>";
        echo "<ul>";
        echo "<li>Start MySQL in XAMPP Control Panel</li>";
        echo "<li>Check if port 3306 is free</li>";
        echo "<li>Try different credentials</li>";
        echo "</ul>";
        exit;
    } else {
        echo "<p class='success'>✅ MySQL connection successful</p>";
        echo "<p class='info'>MySQL Version: " . $mysqli_test->server_info . "</p>";
    }
} catch (Exception $e) {
    echo "<p class='error'>❌ Exception: " . $e->getMessage() . "</p>";
    exit;
}

// Test 3: Check EMS Database
echo "<h2>3. EMS Database</h2>";
$result = $mysqli_test->query("SHOW DATABASES LIKE 'ems'");
if ($result->num_rows === 0) {
    echo "<p class='warning'>⚠️ Database 'ems' doesn't exist, creating...</p>";
    if ($mysqli_test->query("CREATE DATABASE ems")) {
        echo "<p class='success'>✅ Database 'ems' created</p>";
    } else {
        echo "<p class='error'>❌ Failed to create database: " . $mysqli_test->error . "</p>";
        exit;
    }
} else {
    echo "<p class='success'>✅ Database 'ems' exists</p>";
}

// Test 4: Connect to EMS Database
echo "<h2>4. Connect to EMS Database</h2>";
try {
    $mysqli = new mysqli('localhost', 'root', '', 'ems');
    
    if ($mysqli->connect_error) {
        echo "<p class='error'>❌ EMS connection failed: " . $mysqli->connect_error . "</p>";
        exit;
    } else {
        echo "<p class='success'>✅ Connected to EMS database</p>";
    }
} catch (Exception $e) {
    echo "<p class='error'>❌ Exception: " . $e->getMessage() . "</p>";
    exit;
}

// Test 5: Test the Exact Same Logic as index.php
echo "<h2>5. Simulate index.php Connection Logic</h2>";

$mysqlConnected = false;
$mysqli_main = null;

try {
    if (extension_loaded('mysqli')) {
        // First connect without database to check if it exists
        $mysqli_check = new mysqli('localhost', 'root', '');
        
        if ($mysqli_check->connect_errno) {
            throw new Exception($mysqli_check->connect_error);
        }
        
        // Check if database exists, create if not
        $result = $mysqli_check->query("SHOW DATABASES LIKE 'ems'");
        if ($result->num_rows === 0) {
            $mysqli_check->query("CREATE DATABASE ems");
        }
        $mysqli_check->close();
        
        // Now connect to the ems database
        $mysqli_main = new mysqli('localhost', 'root', '', 'ems');

        if ($mysqli_main->connect_errno) {
            throw new Exception($mysqli_main->connect_error);
        }

        $mysqli_main->set_charset('utf8');
        $mysqlConnected = true;
    }
} catch (Exception $e) {
    echo "<p class='error'>❌ Simulated connection failed: " . $e->getMessage() . "</p>";
    $mysqlConnected = false;
}

if ($mysqlConnected) {
    echo "<p class='success'>✅ Simulated connection successful (same as index.php)</p>";
} else {
    echo "<p class='error'>❌ Simulated connection failed (same issue as index.php)</p>";
}

// Test 6: Check Tables
if ($mysqlConnected && $mysqli_main) {
    echo "<h2>6. Check Tables</h2>";
    
    $result = $mysqli_main->query("SHOW TABLES");
    if ($result) {
        echo "<p class='success'>✅ Can query database</p>";
        echo "<p class='info'>Tables in database:</p>";
        echo "<ul>";
        while ($row = $result->fetch_array()) {
            echo "<li>" . $row[0] . "</li>";
        }
        echo "</ul>";
    } else {
        echo "<p class='error'>❌ Cannot query database: " . $mysqli_main->error . "</p>";
    }
}

// Test 7: Environment Variables
echo "<h2>7. Environment Variables</h2>";
echo "<div class='info'>";
echo "<strong>Environment variables being used:</strong><br>";
echo "DB_HOST: " . ($_ENV['DB_HOST'] ?? 'localhost (default)') . "<br>";
echo "DB_USERNAME: " . ($_ENV['DB_USERNAME'] ?? 'root (default)') . "<br>";
echo "DB_PASSWORD: " . ($_ENV['DB_PASSWORD'] ?? '(empty - default)') . "<br>";
echo "</div>";

// Summary
echo "<h2>✅ Summary</h2>";
if ($mysqlConnected) {
    echo "<p class='success'>🎉 Database connection is working!</p>";
    echo "<p class='info'>The issue might be elsewhere. Check:</p>";
    echo "<ul>";
    echo "<li>Autoloader conflicts (composer.json dependencies)</li>";
    echo "<li>Error suppression in index.php</li>";
    echo "<li>Path issues</li>";
    echo "</ul>";
} else {
    echo "<p class='error'>❌ Database connection is failing</p>";
    echo "<p class='info'>Fix MySQL connection first before proceeding.</p>";
}

echo "<h2>🔗 Quick Links</h2>";
echo "<ul>";
echo "<li><a href='debug-database.php'>Full Database Debug</a></li>";
echo "<li><a href='test-employee-api.html'>Employee Test Page</a></li>";
echo "<li><a href='api/health'>Health Check API</a></li>";
echo "</ul>";

echo "</div>";
echo "</body></html>";

// Clean up
$mysqli_test->close();
if ($mysqli_main) {
    $mysqli_main->close();
}
?>
