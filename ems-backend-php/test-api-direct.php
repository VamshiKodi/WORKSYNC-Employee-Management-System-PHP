<?php
/**
 * Direct API Test - Bypass frontend, test backend directly
 */

header('Content-Type: text/html; charset=utf-8');

echo "<html><head><title>Direct API Test</title>";
echo "<style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
    h1 { color: #667eea; }
    .step { margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #667eea; }
    .success { color: #4caf50; font-weight: bold; }
    .error { color: #f44336; font-weight: bold; }
    pre { background: #f0f0f0; padding: 15px; overflow-x: auto; border-radius: 4px; }
    .btn { background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 5px; }
    .btn:hover { background: #5568d3; }
</style></head><body>";

echo "<div class='container'>";
echo "<h1>🧪 Direct API Test</h1>";

// Test 1: Login
echo "<div class='step'>";
echo "<h2>Test 1: Admin Login</h2>";

if (isset($_POST['test_login'])) {
    $loginData = json_encode([
        'username' => 'admin',
        'password' => 'admin123'
    ]);
    
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/json',
            'content' => $loginData
        ]
    ]);
    
    $response = file_get_contents('http://localhost/EMS/ems-backend-php/api/auth/login', false, $context);
    
    if ($response !== false) {
        echo "<p class='success'>✅ Login API Response:</p>";
        echo "<pre>" . json_encode(json_decode($response), JSON_PRETTY_PRINT) . "</pre>";
        
        $data = json_decode($response, true);
        if (isset($data['token'])) {
            $_SESSION['test_token'] = $data['token'];
            echo "<p class='success'>Token saved for next test</p>";
        }
    } else {
        echo "<p class='error'>❌ Login failed</p>";
    }
} else {
    echo "<form method='post'>";
    echo "<button type='submit' name='test_login' class='btn'>Test Admin Login</button>";
    echo "</form>";
}
echo "</div>";

// Test 2: Add Employee
echo "<div class='step'>";
echo "<h2>Test 2: Add Employee</h2>";

session_start();

if (isset($_POST['test_add_employee']) && isset($_SESSION['test_token'])) {
    $employeeData = json_encode([
        'firstName' => 'Test',
        'lastName' => 'Employee',
        'email' => 'test.employee.' . time() . '@company.com',
        'department' => 'Testing',
        'position' => 'Test Position',
        'username' => 'test.user.' . time(),
        'password' => 'password123',
        'role' => 'employee',
        'salary' => 50000
    ]);
    
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $_SESSION['test_token']
            ],
            'content' => $employeeData
        ]
    ]);
    
    $response = file_get_contents('http://localhost/EMS/ems-backend-php/api/employees', false, $context);
    
    if ($response !== false) {
        echo "<p class='success'>✅ Add Employee API Response:</p>";
        echo "<pre>" . json_encode(json_decode($response), JSON_PRETTY_PRINT) . "</pre>";
    } else {
        echo "<p class='error'>❌ Add Employee failed</p>";
        echo "<p>HTTP Response Headers:</p>";
        echo "<pre>" . print_r($http_response_header, true) . "</pre>";
    }
} else if (isset($_POST['test_add_employee'])) {
    echo "<p class='error'>❌ No token available. Please login first.</p>";
} else {
    echo "<form method='post'>";
    echo "<button type='submit' name='test_add_employee' class='btn'>Test Add Employee</button>";
    echo "</form>";
    if (!isset($_SESSION['test_token'])) {
        echo "<p class='error'>⚠️ Login first to get token</p>";
    }
}
echo "</div>";

// Test 3: Database Direct Check
echo "<div class='step'>";
echo "<h2>Test 3: Direct Database Check</h2>";

try {
    $mysqli = new mysqli('localhost', 'root', '', 'ems');
    
    if ($mysqli->connect_error) {
        echo "<p class='error'>❌ Database connection failed: " . $mysqli->connect_error . "</p>";
    } else {
        echo "<p class='success'>✅ Database connected</p>";
        
        // Check employees
        $result = $mysqli->query("SELECT COUNT(*) as count FROM employees");
        if ($result) {
            $row = $result->fetch_assoc();
            echo "<p>Employees in database: <strong>{$row['count']}</strong></p>";
        }
        
        // Check users
        $result = $mysqli->query("SELECT COUNT(*) as count FROM users");
        if ($result) {
            $row = $result->fetch_assoc();
            echo "<p>Users in database: <strong>{$row['count']}</strong></p>";
        }
        
        // Show recent records
        $result = $mysqli->query("SELECT * FROM employees ORDER BY createdAt DESC LIMIT 3");
        if ($result && $result->num_rows > 0) {
            echo "<p><strong>Recent Employees:</strong></p>";
            echo "<pre>";
            while ($row = $result->fetch_assoc()) {
                echo "ID: {$row['employeeId']}, Name: {$row['firstName']} {$row['lastName']}, Email: {$row['email']}\n";
            }
            echo "</pre>";
        }
    }
} catch (Exception $e) {
    echo "<p class='error'>❌ Database error: " . $e->getMessage() . "</p>";
}
echo "</div>";

// Test 4: Health Check
echo "<div class='step'>";
echo "<h2>Test 4: Health Check API</h2>";

$healthResponse = file_get_contents('http://localhost/EMS/ems-backend-php/api/health');
if ($healthResponse !== false) {
    echo "<p class='success'>✅ Health Check Response:</p>";
    echo "<pre>" . json_encode(json_decode($healthResponse), JSON_PRETTY_PRINT) . "</pre>";
} else {
    echo "<p class='error'>❌ Health check failed</p>";
}
echo "</div>";

echo "</div>";
echo "</body></html>";
?>
