<?php

// Start output buffering to prevent any output before headers
ob_start();

// Disable error display for production
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// EMS PHP Backend with MySQL
// Proper structure for production use
// Load Composer's autoloader
require_once __DIR__ . '/vendor/autoload.php';

// Simple .env file loader (no external dependencies needed)
function loadEnv($path) {
  if (!file_exists($path)) {
    return;
  }

  $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  foreach ($lines as $line) {
    // Skip comments
    if (strpos(trim($line), '#') === 0) {
      continue;
    }

    // Split on first = sign
    if (strpos($line, '=') !== false) {
      list($key, $value) = explode('=', $line, 2);
      $_ENV[trim($key)] = trim($value);
    }
  }
}

// Helper: get Authorization header value across different SAPIs
function getAuthHeaderValue() {
  $headers = function_exists('getallheaders') ? getallheaders() : [];
  if (!empty($headers['Authorization'])) return $headers['Authorization'];
  if (!empty($_SERVER['HTTP_AUTHORIZATION'])) return $_SERVER['HTTP_AUTHORIZATION'];
  if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
  return '';
}

// Load environment variables from .env file
loadEnv(__DIR__ . '/.env');

// Simple MySQL connection
$mysqlConnected = false;
$mysqli = null;

try {
    if (extension_loaded('mysqli')) {
        // First connect without database to check if it exists
        $mysqli_check = new mysqli(
            $_ENV['DB_HOST'] ?? 'localhost',
            $_ENV['DB_USERNAME'] ?? 'root',
            $_ENV['DB_PASSWORD'] ?? ''
        );
        
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
        $mysqli = new mysqli(
            $_ENV['DB_HOST'] ?? 'localhost',
            $_ENV['DB_USERNAME'] ?? 'root',
            $_ENV['DB_PASSWORD'] ?? '',
            'ems'
        );

        if ($mysqli->connect_errno) {
            throw new Exception($mysqli->connect_error);
        }

        $mysqli->set_charset('utf8');
        $mysqlConnected = true;
    }
} catch (Exception $e) {
    // MySQL not available, continue without it
    error_log("MySQL connection failed: " . $e->getMessage());
    // For debugging - remove in production
    echo "<!-- MySQL Error: " . $e->getMessage() . " -->";
}

// Handle requests
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove query string and normalize path
$uriParts = explode('?', $requestUri);
$path = rtrim($uriParts[0], '/');

// Remove the base path if present (for subdirectory installations)
$basePath = '/EMS/ems-backend-php';
if (strpos($path, $basePath) === 0) {
    $path = substr($path, strlen($basePath));
}
$path = rtrim($path, '/') ?: '/';

// Simple JWT-like token functions
function generateToken($username, $role, $employeeId) {
    $payload = [
        'username' => $username,
        'role' => $role,
        'employeeId' => $employeeId,
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ];
    return base64_encode(json_encode($payload));
}

function verifyToken($token) {
    try {
        $payload = json_decode(base64_decode($token), true);
        if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
            return false;
        }
        return $payload;
    } catch (Exception $e) {
        return false;
    }
}

// Helper function to send JSON response
function sendJsonResponse($data, $statusCode = 200) {
    // Clear any previous output
    if (ob_get_level()) {
        ob_clean();
    }
    
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Handle CORS
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
$allowed_origins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001'
];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// API info endpoint
if ($path === '/api' || $path === '/api/') {
    echo json_encode([
        'status' => 'OK',
        'message' => 'EMS PHP API is running (MySQL mode)',
        'available_endpoints' => [
            'GET /api/health - Server health check',
            'GET /api/test-users - Database connection test',
            'POST /api/auth/login - User login',
            'GET /api/auth/me - Get current user (requires token)',
            'POST /api/employees - Create employee (admin/hr only, requires token)',
            'GET /api/employees - Get all employees (requires token)'
        ],
        'php_version' => PHP_VERSION,
        'server' => $_SERVER['SERVER_SOFTWARE'],
        'database' => $mysqlConnected ? 'MySQL connected' : 'MySQL not available',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit;
}

// Authentication endpoints
if ($path === '/api/auth/login') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !isset($input['username']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Username and password required']);
        exit;
    }

    $username = $input['username'];
    $password = $input['password'];

    // Demo authentication (for default admin/hr accounts)
    $demoUsers = [
        'admin' => ['password' => 'admin123', 'role' => 'admin', 'employeeId' => 'ADM001'],
        'employee' => ['password' => 'employee123', 'role' => 'employee', 'employeeId' => 'E001'],
        'hr' => ['password' => 'hr123', 'role' => 'hr', 'employeeId' => 'E002']
    ];

    $authenticated = false;
    $userData = null;

    // First, check demo users
    if (isset($demoUsers[$username]) && $demoUsers[$username]['password'] === $password) {
        $authenticated = true;
        $userData = [
            'username' => $username,
            'role' => $demoUsers[$username]['role'],
            'employeeId' => $demoUsers[$username]['employeeId'],
            'email' => $username . '@company.com'
        ];
    }
    
    // If not found in demo users, check database users
    if (!$authenticated && $mysqlConnected && $mysqli) {
        $stmt = $mysqli->prepare("SELECT * FROM users WHERE username = ? OR email = ?");
        if ($stmt) {
            $stmt->bind_param("ss", $username, $username);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                $user = $result->fetch_assoc();
                
                // Verify password
                if (password_verify($password, $user['password'])) {
                    $authenticated = true;
                    $userData = [
                        'username' => $user['username'],
                        'role' => $user['role'],
                        'employeeId' => $user['employeeId'],
                        'email' => $user['email']
                    ];
                }
            }
        }
    }

    if ($authenticated && $userData) {
        $token = generateToken($userData['username'], $userData['role'], $userData['employeeId']);

        // Log login activity
        if ($mysqlConnected && $mysqli) {
            logActivity($mysqli, $userData['username'], $userData['username'], 'login', "User {$userData['username']} logged into the system", 'auth');
        }

        sendJsonResponse([
            'success' => true,
            'token' => $token,
            'user' => $userData,
            'message' => 'Login successful'
        ]);
    } else {
        sendJsonResponse(['error' => 'Invalid credentials'], 401);
    }
    exit;
}

if ($path === '/api/auth/me') {
    $authHeader = getAuthHeaderValue();

    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'No token provided']);
        exit;
    }

    $token = $matches[1];
    $tokenData = verifyToken($token);

    if (!$tokenData) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'user' => [
            'username' => $tokenData['username'],
            'role' => $tokenData['role'],
            'employeeId' => $tokenData['employeeId'],
            'email' => $tokenData['username'] . '@company.com'
        ]
    ]);
    exit;
}

// Health check endpoint
if ($path === '/api/health') {
    echo json_encode([
        'status' => 'OK',
        'message' => 'EMS PHP API is running (MySQL mode)',
        'database' => $mysqlConnected ? 'MySQL connected' : 'MySQL not available',
        'php_version' => PHP_VERSION,
        'server' => $_SERVER['SERVER_SOFTWARE'],
        'timestamp' => date('Y-m-d H:i:s'),
        'debug' => [
            'path' => $path, 
            'uri' => $requestUri,
            'mysqlConnected' => $mysqlConnected,
            'mysqli_extension' => extension_loaded('mysqli')
        ]
    ]);
    exit;
}

// Debug endpoint to test connection
if ($path === '/api/debug-connection') {
    $testResult = [];
    
    try {
        $test_mysqli = new mysqli('localhost', 'root', '', 'ems');
        if ($test_mysqli->connect_error) {
            $testResult['error'] = $test_mysqli->connect_error;
        } else {
            $testResult['success'] = 'Connection successful';
            $testResult['server_info'] = $test_mysqli->server_info;
            $test_mysqli->close();
        }
    } catch (Exception $e) {
        $testResult['exception'] = $e->getMessage();
    }
    
    echo json_encode([
        'main_connection' => $mysqlConnected,
        'test_connection' => $testResult,
        'mysqli_loaded' => extension_loaded('mysqli')
    ]);
    exit;
}

// Test users endpoint (for debugging)
if ($path === '/api/test-users') {
    if ($mysqlConnected && $mysqli) {
        try {
            $result = $mysqli->query("SHOW TABLES LIKE 'users'");
            $tablesExist = $result->num_rows > 0;

            if ($tablesExist) {
                $result = $mysqli->query("SELECT COUNT(*) as count FROM users");
                $row = $result->fetch_assoc();
                $userCount = $row['count'];

                echo json_encode([
                    'success' => true,
                    'database' => 'MySQL connected',
                    'tables_exist' => true,
                    'user_count' => $userCount,
                    'message' => "Found $userCount users in database"
                ]);
            } else {
                echo json_encode([
                    'success' => true,
                    'database' => 'MySQL connected',
                    'tables_exist' => false,
                    'message' => 'MySQL connected but no users table found',
                    'note' => 'Run database migrations to create tables'
                ]);
            }
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'error' => 'Database query failed: ' . $e->getMessage(),
                'database_status' => 'connected_but_error'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'MySQL not connected - Start MySQL in XAMPP Control Panel',
            'database_status' => 'not_connected',
            'solution' => 'Open XAMPP Control Panel -> Start MySQL module',
            'available_features' => [
                'Health Check: /api/health',
                'API Status: /api/test-users (shows this message)',
                'Employee Management: Requires MySQL'
            ]
        ]);
    }
    exit;
}

// Employee Management Endpoints
if (strpos($path, '/api/employees') !== false) {
    // Verify authentication
    $authHeader = getAuthHeaderValue();
    
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }
    
    $token = $matches[1];
    $tokenData = verifyToken($token);
    
    if (!$tokenData) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit;
    }
    
    // POST /api/employees - Create new employee
    if ($path === '/api/employees' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!$mysqlConnected || !$mysqli) {
            http_response_code(503);
            echo json_encode(['error' => 'Database not available']);
            exit;
        }
        
        // Only admin and hr can create employees
        if (!in_array($tokenData['role'], ['admin', 'hr'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Permission denied. Only admin and HR can add employees.']);
            exit;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $required = ['firstName', 'lastName', 'email', 'department', 'position', 'username', 'password'];
        foreach ($required as $field) {
            if (!isset($input[$field]) || empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['error' => ucfirst($field) . ' is required']);
                exit;
            }
        }
        
        // Validate email format
        if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email format']);
            exit;
        }
        
        // Validate password length
        if (strlen($input['password']) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 6 characters']);
            exit;
        }
        
        // Check if employees table exists, create if not
        $result = $mysqli->query("SHOW TABLES LIKE 'employees'");
        if ($result->num_rows === 0) {
            $createTable = "CREATE TABLE employees (
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
            
            if (!$mysqli->query($createTable)) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create employees table: ' . $mysqli->error]);
                exit;
            }
        }
        
        // Check if users table exists, create if not
        $result = $mysqli->query("SHOW TABLES LIKE 'users'");
        if ($result->num_rows === 0) {
            $createUsersTable = "CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'employee',
                employeeId VARCHAR(50) UNIQUE NOT NULL,
                isActive BOOLEAN DEFAULT TRUE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE
            )";
            
            if (!$mysqli->query($createUsersTable)) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create users table: ' . $mysqli->error]);
                exit;
            }
        }
        
        // Check if email already exists
        $stmt = $mysqli->prepare("SELECT id FROM employees WHERE email = ?");
        $stmt->bind_param("s", $input['email']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Employee with this email already exists']);
            exit;
        }
        
        // Check if username already exists
        $stmt = $mysqli->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->bind_param("s", $input['username']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Username already exists']);
            exit;
        }
        
        // Generate sequential employee ID
$result = $mysqli->query("SELECT employeeId FROM employees ORDER BY id DESC LIMIT 1");
if ($result && $result->num_rows > 0) {
    $lastId = $result->fetch_assoc()['employeeId'];
    $num = (int) substr($lastId, 1); // Get number part
    $newNum = $num + 1;
    $employeeId = 'E' . str_pad($newNum, 3, '0', STR_PAD_LEFT);
} else {
    // No employees exist yet, start with E001
    $employeeId = 'E001';
}
        
        // Insert employee
        $stmt = $mysqli->prepare(
            "INSERT INTO employees (employeeId, firstName, lastName, email, phone, department, position, hireDate, salary, address) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        
        $hireDate = $input['hireDate'] ?? date('Y-m-d');
        $salary = $input['salary'] ?? 0;
        $phone = $input['phone'] ?? '';
        $address = $input['address'] ?? '';
        
        $stmt->bind_param(
            "ssssssssds",
            $employeeId,
            $input['firstName'],
            $input['lastName'],
            $input['email'],
            $phone,
            $input['department'],
            $input['position'],
            $hireDate,
            $salary,
            $address
        );
        
        if ($stmt->execute()) {
            $newEmployeeId = $mysqli->insert_id;
            
            // Create user account for the employee
            $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
            $userRole = $input['role'] ?? 'employee';
            
            $userStmt = $mysqli->prepare(
                "INSERT INTO users (username, email, password, role, employeeId) 
                 VALUES (?, ?, ?, ?, ?)"
            );
            
            $userStmt->bind_param(
                "sssss",
                $input['username'],
                $input['email'],
                $hashedPassword,
                $userRole,
                $employeeId
            );
            
            if ($userStmt->execute()) {
                // Fetch the created employee
                $result = $mysqli->query("SELECT * FROM employees WHERE id = $newEmployeeId");
                $employee = $result->fetch_assoc();
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Employee added successfully and user account created',
                    'data' => $employee,
                    'credentials' => [
                        'username' => $input['username'],
                        'temporaryPassword' => $input['password'],
                        'message' => 'Share these credentials with the employee'
                    ]
                ]);
            } else {
                // Rollback: delete the employee if user creation failed
                $mysqli->query("DELETE FROM employees WHERE id = $newEmployeeId");
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create user account: ' . $mysqli->error]);
            }
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update employee: ' . $mysqli->error]);
        }
        exit;
    }
    
    // PUT /api/employees/{id} - Update employee
    if (preg_match('#^/api/employees/(\d+)$#', $path, $matches) && $_SERVER['REQUEST_METHOD'] === 'PUT') {
        if (!$mysqlConnected || !$mysqli) {
            http_response_code(503);
            echo json_encode(['error' => 'Database not available']);
            exit;
        }
        
        // Only admin and hr can update employees
        if (!in_array($tokenData['role'], ['admin', 'hr'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Permission denied. Only admin and HR can update employees.']);
            exit;
        }
        
        $employeeId = $matches[1];
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        
        // Allowed updatable fields
        $fields = ['firstName','lastName','email','phone','department','position','hireDate','salary','address','status'];
        $setParts = [];
        $params = [];
        $types = '';
        foreach ($fields as $f) {
            if (array_key_exists($f, $input)) {
                $setParts[] = "$f = ?";
                $params[] = $input[$f];
                $types .= ($f === 'salary') ? 'd' : 's';
            }
        }
        
        if (empty($setParts)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit;
        }
        
        $sql = 'UPDATE employees SET ' . implode(', ', $setParts) . ' WHERE id = ?';
        $types .= 'i';
        $params[] = (int)$employeeId;
        
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to prepare statement: ' . $mysqli->error]);
            exit;
        }
        
        $stmt->bind_param($types, ...$params);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'updated' => $stmt->affected_rows]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update employee: ' . $stmt->error]);
        }
        exit;
    }
    
    // PUT /api/employees/{id}/credentials - Update employee credentials
    if (preg_match('#^/api/employees/(\d+)/credentials$#', $path, $matches) && $_SERVER['REQUEST_METHOD'] === 'PUT') {
        if (!$mysqlConnected || !$mysqli) {
            http_response_code(503);
            echo json_encode(['error' => 'Database not available']);
            exit;
        }
        
        // Only admin and hr can update credentials
        if (!in_array($tokenData['role'], ['admin', 'hr'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Permission denied. Only admin and HR can update credentials.']);
            exit;
        }
        
        $employeeId = $matches[1];
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $required = ['username', 'password'];
        foreach ($required as $field) {
            if (!isset($input[$field]) || empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['error' => ucfirst($field) . ' is required']);
                exit;
            }
        }
        
        // Validate password length
        if (strlen($input['password']) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 6 characters']);
            exit;
        }
        
        // First, get the actual employeeId from the employees table
        $stmt = $mysqli->prepare("SELECT employeeId FROM employees WHERE id = ?");
        $stmt->bind_param("i", $employeeId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Employee not found']);
            exit;
        }
        
        $employee = $result->fetch_assoc();
        $actualEmployeeId = $employee['employeeId'];
        
        // Update employee credentials using the actual employeeId
        $stmt = $mysqli->prepare(
            "UPDATE users SET username = ?, password = ? WHERE employeeId = ?"
        );
        
        $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
        
        $stmt->bind_param(
            "sss",
            $input['username'],
            $hashedPassword,
            $actualEmployeeId
        );
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Employee credentials updated successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update employee credentials: ' . $mysqli->error]);
        }
        exit;
    }
    
    // DELETE /api/employees/{id} - Delete employee
    if (preg_match('#^/api/employees/(\d+)$#', $path, $matches) && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
        if (!$mysqlConnected || !$mysqli) {
            http_response_code(503);
            echo json_encode(['error' => 'Database not available']);
            exit;
        }
        
        // Only admin and hr can delete employees
        if (!in_array($tokenData['role'], ['admin', 'hr'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Permission denied. Only admin and HR can delete employees.']);
            exit;
        }
        
        $employeeId = $matches[1];
        
        // First, get the employeeId to delete the corresponding user account
        $stmt = $mysqli->prepare("SELECT employeeId FROM employees WHERE id = ?");
        $stmt->bind_param("i", $employeeId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Employee not found']);
            exit;
        }
        
        $employee = $result->fetch_assoc();
        $empId = $employee['employeeId'];
        
        // Start transaction to ensure both deletions succeed or fail together
        $mysqli->begin_transaction();
        
        try {
            // Delete from users table first (due to foreign key constraint)
            $userStmt = $mysqli->prepare("DELETE FROM users WHERE employeeId = ?");
            $userStmt->bind_param("s", $empId);
            $userStmt->execute();
            
            // Delete from employees table
            $empStmt = $mysqli->prepare("DELETE FROM employees WHERE id = ?");
            $empStmt->bind_param("i", $employeeId);
            $empStmt->execute();
            
            // Commit the transaction
            $mysqli->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Employee and user account deleted successfully'
            ]);
        } catch (Exception $e) {
            // Rollback the transaction on error
            $mysqli->rollback();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete employee: ' . $e->getMessage()]);
        }
        exit;
    }
    
    // GET /api/departments/overview - Get departments overview
    if ($path === '/api/departments/overview' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        if (!$mysqlConnected || !$mysqli) {
            http_response_code(503);
            echo json_encode(['error' => 'Database not available']);
            exit;
        }
        
        $result = $mysqli->query("SELECT department, COUNT(*) AS count FROM employees GROUP BY department");
        
        if ($result) {
            $departments = [];
            while ($row = $result->fetch_assoc()) {
                $departments[] = $row;
            }
            
            echo json_encode([
                'success' => true,
                'data' => $departments
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'data' => [],
                'message' => 'No departments found'
            ]);
        }
        exit;
    }
    
    // GET /api/employees - Get all employees
    if ($path === '/api/employees' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        if (!$mysqlConnected || !$mysqli) {
            http_response_code(503);
            echo json_encode(['error' => 'Database not available']);
            exit;
        }
        
        // Check if employees table exists, create if not
        $tableCheck = $mysqli->query("SHOW TABLES LIKE 'employees'");
        if ($tableCheck->num_rows === 0) {
            // Create employees table
            $createTable = "CREATE TABLE employees (
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
            
            if (!$mysqli->query($createTable)) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create employees table: ' . $mysqli->error]);
                exit;
            }
        }
        
        $result = $mysqli->query("SELECT * FROM employees ORDER BY id ASC");
        
        if ($result) {
            $employees = [];
            while ($row = $result->fetch_assoc()) {
                $employees[] = $row;
            }
            
            echo json_encode([
                'success' => true,
                'data' => $employees,
                'count' => count($employees)
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'data' => [],
                'count' => 0,
                'message' => 'No employees found'
            ]);
        }
        exit;
    }
    
    // If none of the above matched
    http_response_code(404);
    echo json_encode(['error' => 'Employee endpoint not found']);
    exit;
}

// GET /api/departments/overview (global)
if ($path === '/api/departments/overview' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($mysqlConnected && $mysqli) {
        $departments = [];
        $res = $mysqli->query('SELECT department, COUNT(*) as count FROM employees GROUP BY department');
        if ($res) { while ($row = $res->fetch_assoc()) { $departments[] = ['department'=>$row['department']?:'Unknown','count'=>(int)$row['count']]; } }
        $attendanceSummary = [
            ['status'=>'Present','count'=>45,'color'=>'#4CAF50'],
            ['status'=>'Absent','count'=>3,'color'=>'#F44336'],
            ['status'=>'Late','count'=>2,'color'=>'#FF9800']
        ];
        echo json_encode(['success'=>true,'departments'=>$departments,'attendanceSummary'=>$attendanceSummary,'totalDepartments'=>count($departments),'totalEmployees'=>array_sum(array_map(fn($d)=>$d['count'],$departments))]);
    } else {
        echo json_encode(['success'=>true,'departments'=>[
            ['department'=>'Engineering','count'=>20],
            ['department'=>'HR','count'=>5],
            ['department'=>'Finance','count'=>8],
            ['department'=>'Marketing','count'=>10],
            ['department'=>'Operations','count'=>7],
        ],'attendanceSummary'=>[
            ['status'=>'Present','count'=>45,'color'=>'#4CAF50'],
            ['status'=>'Absent','count'=>3,'color'=>'#F44336'],
            ['status'=>'Late','count'=>2,'color'=>'#FF9800'],
        ],'totalDepartments'=>5,'totalEmployees'=>50]);
    }
    exit;
}

// ==================== LEAVE REQUESTS API ====================

// Authentication check for leave requests
if (strpos($path, '/api/leave-requests') === 0) {
    $authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $authMatches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized - No token provided']);
        exit;
    }
    
    $token = $authMatches[1];
    $tokenData = verifyToken($token);
    
    if (!$tokenData) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized - Invalid token']);
        exit;
    }
}

// GET /api/leave-requests - Get all leave requests (admin/hr see all, employees see only their own)
if ($path === '/api/leave-requests' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!$mysqlConnected || !$mysqli) {
        http_response_code(503);
        echo json_encode(['error' => 'Database not available']);
        exit;
    }
    
    // Check if table exists
    $tableCheck = $mysqli->query("SHOW TABLES LIKE 'leave_requests'");
    if ($tableCheck->num_rows === 0) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Leave requests table does not exist. Please run create-leave-requests-table.php',
            'setup_url' => 'http://localhost/EMS/ems-backend-php/create-leave-requests-table.php'
        ]);
        exit;
    }
    
    // Admin and HR can see all requests, employees see only their own
    if (in_array($tokenData['role'], ['admin', 'hr'])) {
        $result = $mysqli->query("SELECT * FROM leave_requests ORDER BY createdAt DESC");
    } else {
        $stmt = $mysqli->prepare("SELECT * FROM leave_requests WHERE employeeId = ? ORDER BY createdAt DESC");
        $stmt->bind_param("s", $tokenData['employeeId']);
        $stmt->execute();
        $result = $stmt->get_result();
    }
    
    if ($result) {
        $requests = [];
        while ($row = $result->fetch_assoc()) {
            $requests[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'data' => $requests,
            'count' => count($requests)
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'data' => [],
            'count' => 0,
            'message' => 'No leave requests found'
        ]);
    }
    exit;
}

// POST /api/leave-requests - Create new leave request
if ($path === '/api/leave-requests' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!$mysqlConnected || !$mysqli) {
        http_response_code(503);
        echo json_encode(['error' => 'Database not available']);
        exit;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required = ['leaveType', 'startDate', 'endDate', 'reason'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => ucfirst($field) . ' is required']);
            exit;
        }
    }
    
    // Get employee name from employees table
    $empStmt = $mysqli->prepare("SELECT firstName, lastName FROM employees WHERE employeeId = ?");
    $empStmt->bind_param("s", $tokenData['employeeId']);
    $empStmt->execute();
    $empResult = $empStmt->get_result();
    
    if ($empResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Employee not found']);
        exit;
    }
    
    $employee = $empResult->fetch_assoc();
    $employeeName = $employee['firstName'] . ' ' . $employee['lastName'];
    
    // Insert leave request
    $stmt = $mysqli->prepare(
        "INSERT INTO leave_requests (employeeId, employeeName, leaveType, startDate, endDate, reason, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'pending')"
    );
    
    $stmt->bind_param(
        "ssssss",
        $tokenData['employeeId'],
        $employeeName,
        $input['leaveType'],
        $input['startDate'],
        $input['endDate'],
        $input['reason']
    );
    
    if ($stmt->execute()) {
        $leaveRequestId = $mysqli->insert_id;
        
        // Create notification for admin/hr
        createNotification(
            $mysqli,
            null,
            'admin',
            'New Leave Request',
            "New leave request from {$employeeName} for {$input['leaveType']} from {$input['startDate']} to {$input['endDate']}",
            'info',
            'leave',
            $employeeName,
            $leaveRequestId,
            'leave_request'
        );
        
        // Also notify HR
        createNotification(
            $mysqli,
            null,
            'hr',
            'New Leave Request',
            "New leave request from {$employeeName} for {$input['leaveType']} from {$input['startDate']} to {$input['endDate']}",
            'info',
            'leave',
            $employeeName,
            $leaveRequestId,
            'leave_request'
        );
        
        echo json_encode([
            'success' => true,
            'message' => 'Leave request submitted successfully',
            'id' => $leaveRequestId
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create leave request: ' . $mysqli->error]);
    }
    exit;
}


// PUT /api/leave-requests/{id}/approve - Approve leave request (admin/hr only)
if (preg_match('#^/api/leave-requests/(\d+)/approve$#', $path, $matches) && $_SERVER['REQUEST_METHOD'] === 'PUT') {
    if (!$mysqlConnected || !$mysqli) {
        http_response_code(503);
        echo json_encode(['error' => 'Database not available']);
        exit;
    }
    
    // Only admin and hr can approve
    if (!in_array($tokenData['role'], ['admin', 'hr'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Permission denied. Only admin and HR can approve leave requests.']);
        exit;
    }
    
    $requestId = $matches[1];
    $input = json_decode(file_get_contents('php://input'), true);
    $comments = $input['comments'] ?? '';
    
    $stmt = $mysqli->prepare(
        "UPDATE leave_requests 
         SET status = 'approved', reviewedBy = ?, reviewedAt = NOW(), reviewComments = ? 
         WHERE id = ?"
    );
    
    $stmt->bind_param("ssi", $tokenData['username'], $comments, $requestId);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            // Get leave request details to notify employee
            $leaveStmt = $mysqli->prepare("SELECT employeeId, employeeName, leaveType, startDate, endDate FROM leave_requests WHERE id = ?");
            $leaveStmt->bind_param("i", $requestId);
            $leaveStmt->execute();
            $leaveResult = $leaveStmt->get_result();
            
            if ($leaveData = $leaveResult->fetch_assoc()) {
                // Get employee's username
                $userStmt = $mysqli->prepare("SELECT username FROM users WHERE employeeId = ?");
                $userStmt->bind_param("s", $leaveData['employeeId']);
                $userStmt->execute();
                $userResult = $userStmt->get_result();
                
                if ($userData = $userResult->fetch_assoc()) {
                    // Notify employee
                    createNotification(
                        $mysqli,
                        $userData['username'],
                        null,
                        'Leave Request Approved',
                        "Your {$leaveData['leaveType']} request from {$leaveData['startDate']} to {$leaveData['endDate']} has been approved by {$tokenData['username']}",
                        'success',
                        'leave',
                        $tokenData['username'],
                        $requestId,
                        'leave_request'
                    );
                }
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Leave request approved successfully'
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Leave request not found']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to approve leave request: ' . $mysqli->error]);
    }
    exit;
}


// PUT /api/leave-requests/{id}/reject - Reject leave request (admin/hr only)
if (preg_match('#^/api/leave-requests/(\d+)/reject$#', $path, $matches) && $_SERVER['REQUEST_METHOD'] === 'PUT') {
    if (!$mysqlConnected || !$mysqli) {
        http_response_code(503);
        echo json_encode(['error' => 'Database not available']);
        exit;
    }
    
    // Only admin and hr can reject
    if (!in_array($tokenData['role'], ['admin', 'hr'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Permission denied. Only admin and HR can reject leave requests.']);
        exit;
    }
    
    $requestId = $matches[1];
    $input = json_decode(file_get_contents('php://input'), true);
    $comments = $input['comments'] ?? '';
    
    $stmt = $mysqli->prepare(
        "UPDATE leave_requests 
         SET status = 'rejected', reviewedBy = ?, reviewedAt = NOW(), reviewComments = ? 
         WHERE id = ?"
    );
    
    $stmt->bind_param("ssi", $tokenData['username'], $comments, $requestId);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            // Get leave request details to notify employee
            $leaveStmt = $mysqli->prepare("SELECT employeeId, employeeName, leaveType, startDate, endDate FROM leave_requests WHERE id = ?");
            $leaveStmt->bind_param("i", $requestId);
            $leaveStmt->execute();
            $leaveResult = $leaveStmt->get_result();
            
            if ($leaveData = $leaveResult->fetch_assoc()) {
                // Get employee's username
                $userStmt = $mysqli->prepare("SELECT username FROM users WHERE employeeId = ?");
                $userStmt->bind_param("s", $leaveData['employeeId']);
                $userStmt->execute();
                $userResult = $userStmt->get_result();
                
                if ($userData = $userResult->fetch_assoc()) {
                    // Notify employee
                    createNotification(
                        $mysqli,
                        $userData['username'],
                        null,
                        'Leave Request Rejected',
                        "Your {$leaveData['leaveType']} request from {$leaveData['startDate']} to {$leaveData['endDate']} has been rejected by {$tokenData['username']}",
                        'error',
                        'leave',
                        $tokenData['username'],
                        $requestId,
                        'leave_request'
                    );
                }
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Leave request rejected'
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Leave request not found']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to reject leave request: ' . $mysqli->error]);
    }
    exit;
}

// DELETE /api/leave-requests/{id} - Delete leave request (own requests or admin/hr)
if (preg_match('#^/api/leave-requests/(\d+)$#', $path, $matches) && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!$mysqlConnected || !$mysqli) {
        http_response_code(503);
        echo json_encode(['error' => 'Database not available']);
        exit;
    }
    
    $requestId = $matches[1];
    
    // Check if user owns this request or is admin/hr
    if (in_array($tokenData['role'], ['admin', 'hr'])) {
        $stmt = $mysqli->prepare("DELETE FROM leave_requests WHERE id = ?");
        $stmt->bind_param("i", $requestId);
    } else {
        $stmt = $mysqli->prepare("DELETE FROM leave_requests WHERE id = ? AND employeeId = ?");
        $stmt->bind_param("is", $requestId, $tokenData['employeeId']);
    }
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Leave request deleted successfully'
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Leave request not found or permission denied']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete leave request: ' . $mysqli->error]);
    }
    exit;
}

// ==================== ACTIVITY LOG API ====================

// Helper function to log activity
function logActivity($mysqli, $userId, $username, $action, $description, $category = 'general', $relatedId = null, $relatedType = null) {
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
    
    $stmt = $mysqli->prepare(
        "INSERT INTO activity_log (userId, username, action, description, category, relatedId, relatedType, ipAddress, userAgent) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param("sssssssss", $userId, $username, $action, $description, $category, $relatedId, $relatedType, $ipAddress, $userAgent);
    return $stmt->execute();
}

// GET /api/activities - Get activity log
if ($path === '/api/activities' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    // Check database connection (same as other endpoints)
    if (!isset($mysqli) || !$mysqli) {
        http_response_code(503);
        echo json_encode(['error' => 'Database connection not available']);
        exit;
    }
    
    // Check if table exists
    try {
        $tableCheck = $mysqli->query("SHOW TABLES LIKE 'activity_log'");
        if (!$tableCheck || $tableCheck->num_rows === 0) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Activity log table does not exist. Please run create-activity-log-table.php',
                'setup_url' => 'http://localhost/EMS/ems-backend-php/create-activity-log-table.php'
            ]);
            exit;
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        exit;
    }
    
    // Check for authentication
    $authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $authMatches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $token = $authMatches[1];
    $tokenData = verifyToken($token);
    
    if (!$tokenData) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    
    // Get limit from query params (default 50)
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
    
    // Admin and HR see all activities, employees see only their own
    if (in_array($tokenData['role'], ['admin', 'hr'])) {
        $stmt = $mysqli->prepare("SELECT * FROM activity_log ORDER BY createdAt DESC LIMIT ?");
        $stmt->bind_param("i", $limit);
    } else {
        $stmt = $mysqli->prepare("SELECT * FROM activity_log WHERE userId = ? ORDER BY createdAt DESC LIMIT ?");
        $stmt->bind_param("si", $tokenData['username'], $limit);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $activities = [];
    while ($row = $result->fetch_assoc()) {
        $activities[] = [
            'id' => $row['id'],
            'userId' => $row['userId'],
            'username' => $row['username'],
            'action' => $row['action'],
            'description' => $row['description'],
            'category' => $row['category'],
            'timestamp' => $row['createdAt'],
            'relatedId' => $row['relatedId'],
            'relatedType' => $row['relatedType']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $activities,
        'count' => count($activities)
    ]);
    exit;
}

// ==================== TASKS API ====================

// GET /api/tasks - Get tasks
if ($path === '/api/tasks' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($mysqli) || !$mysqli) {
        http_response_code(503);
        echo json_encode(['error' => 'Database connection not available']);
        exit;
    }
    
    // Check for authentication
    $authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $authMatches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $token = $authMatches[1];
    $tokenData = verifyToken($token);
    
    if (!$tokenData) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    
    // Admin/HR see all tasks, employees see only their tasks
    if (in_array($tokenData['role'], ['admin', 'hr'])) {
        $result = $mysqli->query("SELECT * FROM tasks ORDER BY createdAt DESC");
    } else {
        $stmt = $mysqli->prepare("SELECT * FROM tasks WHERE assignedTo = ? ORDER BY createdAt DESC");
        $stmt->bind_param("s", $tokenData['employeeId']);
        $stmt->execute();
        $result = $stmt->get_result();
    }
    
    $tasks = [];
    while ($row = $result->fetch_assoc()) {
        $tasks[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $tasks,
        'count' => count($tasks)
    ]);
    exit;
}

// POST /api/tasks - Create new task (admin/hr only)
if ($path === '/api/tasks' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($mysqli) || !$mysqli) {
        http_response_code(503);
        echo json_encode(['error' => 'Database connection not available']);
        exit;
    }
    
    // Check for authentication
    $authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $authMatches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $token = $authMatches[1];
    $tokenData = verifyToken($token);
    
    if (!$tokenData) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    
    // Only admin/hr can create tasks
    if (!in_array($tokenData['role'], ['admin', 'hr'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Permission denied']);
        exit;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($input['title']) || !isset($input['assignedTo'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Title and assignedTo are required']);
        exit;
    }
    
    // Get assigned employee name
    $empStmt = $mysqli->prepare("SELECT firstName, lastName FROM employees WHERE employeeId = ?");
    $empStmt->bind_param("s", $input['assignedTo']);
    $empStmt->execute();
    $empResult = $empStmt->get_result();
    
    if ($empResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Employee not found']);
        exit;
    }
    
    $employee = $empResult->fetch_assoc();
    $assignedToName = $employee['firstName'] . ' ' . $employee['lastName'];
    
    $stmt = $mysqli->prepare(
        "INSERT INTO tasks (title, description, assignedTo, assignedToName, assignedBy, assignedByName, priority, dueDate) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    
    $description = $input['description'] ?? '';
    $priority = $input['priority'] ?? 'medium';
    $dueDate = $input['dueDate'] ?? null;
    $assignedByName = $tokenData['username'];
    
    $stmt->bind_param(
        "ssssssss",
        $input['title'],
        $description,
        $input['assignedTo'],
        $assignedToName,
        $tokenData['username'],
        $assignedByName,
        $priority,
        $dueDate
    );
    
    if ($stmt->execute()) {
        $taskId = $mysqli->insert_id;
        
        // Create notification for assigned employee
        createNotification(
            $mysqli,
            $input['assignedTo'],
            null,
            'New Task Assigned',
            "You have been assigned a new task: {$input['title']}",
            'info',
            'task',
            $tokenData['username'],
            $taskId,
            'task'
        );
        
        // Log activity
        logActivity(
            $mysqli,
            $tokenData['username'],
            $tokenData['username'],
            'create_task',
            "Created task '{$input['title']}' and assigned to {$assignedToName}",
            'task',
            $taskId,
            'task'
        );
        
        echo json_encode([
            'success' => true,
            'message' => 'Task created successfully',
            'id' => $taskId
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create task: ' . $mysqli->error]);
    }
    exit;
}

// PUT /api/tasks/{id} - Update task status
if (preg_match('#^/api/tasks/(\d+)$#', $path, $matches) && $_SERVER['REQUEST_METHOD'] === 'PUT') {
    if (!isset($mysqli) || !$mysqli) {
        http_response_code(503);
        echo json_encode(['error' => 'Database connection not available']);
        exit;
    }
    
    // Check for authentication
    $authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $authMatches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $token = $authMatches[1];
    $tokenData = verifyToken($token);
    
    if (!$tokenData) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    
    $taskId = $matches[1];
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (isset($input['status'])) {
        $completedAt = $input['status'] === 'completed' ? date('Y-m-d H:i:s') : null;
        
        $stmt = $mysqli->prepare("UPDATE tasks SET status = ?, completedAt = ? WHERE id = ?");
        $stmt->bind_param("ssi", $input['status'], $completedAt, $taskId);
        
        if ($stmt->execute()) {
            // Log activity
            logActivity(
                $mysqli,
                $tokenData['username'],
                $tokenData['username'],
                'update_task',
                "Updated task status to {$input['status']}",
                'task',
                $taskId,
                'task'
            );
            
            echo json_encode([
                'success' => true,
                'message' => 'Task updated successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update task']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Status is required']);
    }
    exit;
}

// DELETE /api/tasks/{id} - Delete task (admin/hr only)
if (preg_match('#^/api/tasks/(\d+)$#', $path, $matches) && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!isset($mysqli) || !$mysqli) {
        http_response_code(503);
        echo json_encode(['error' => 'Database connection not available']);
        exit;
    }
    
    // Check for authentication
    $authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $authMatches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $token = $authMatches[1];
    $tokenData = verifyToken($token);
    
    if (!$tokenData) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    
    // Only admin/hr can delete tasks
    if (!in_array($tokenData['role'], ['admin', 'hr'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Permission denied']);
        exit;
    }
    
    $taskId = $matches[1];
    
    $stmt = $mysqli->prepare("DELETE FROM tasks WHERE id = ?");
    $stmt->bind_param("i", $taskId);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Task deleted successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete task']);
    }
    exit;
}

// ==================== NOTIFICATIONS API ====================

// Helper function to create notification
function createNotification($mysqli, $userId, $recipientRole, $title, $message, $type, $category, $sender, $relatedId = null, $relatedType = null) {
    $stmt = $mysqli->prepare(
        "INSERT INTO notifications (userId, recipientRole, title, message, type, category, sender, relatedId, relatedType) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param("sssssssss", $userId, $recipientRole, $title, $message, $type, $category, $sender, $relatedId, $relatedType);
    return $stmt->execute();
}

// GET /api/notifications - Get notifications for current user
if ($path === '/api/notifications' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!$mysqlConnected || !$mysqli) {
        http_response_code(503);
        echo json_encode(['error' => 'Database not available']);
        exit;
    }
    
    // Check for authentication
    $authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $authMatches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $token = $authMatches[1];
    $tokenData = verifyToken($token);
    
    if (!$tokenData) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    
    // Get notifications for specific user OR for their role
    $stmt = $mysqli->prepare(
        "SELECT * FROM notifications 
         WHERE (userId = ? OR recipientRole = ? OR (userId IS NULL AND recipientRole IS NULL))
         ORDER BY createdAt DESC"
    );
    $stmt->bind_param("ss", $tokenData['username'], $tokenData['role']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $notifications = [];
    while ($row = $result->fetch_assoc()) {
        $notifications[] = [
            'id' => $row['id'],
            'title' => $row['title'],
            'message' => $row['message'],
            'type' => $row['type'],
            'category' => $row['category'],
            'sender' => $row['sender'],
            'read' => (bool)$row['isRead'],
            'timestamp' => $row['createdAt'],
            'relatedId' => $row['relatedId'],
            'relatedType' => $row['relatedType']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $notifications,
        'count' => count($notifications)
    ]);
    exit;
}

// PUT /api/notifications/mark-all-read - Mark all notifications as read
if ($path === '/api/notifications/mark-all-read' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
    if (!isset($mysqli) || !$mysqli) {
        http_response_code(503);
        echo json_encode(['error' => 'Database connection not available']);
        exit;
    }
    
    // Check for authentication
    $authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $authMatches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $token = $authMatches[1];
    $tokenData = verifyToken($token);
    
    if (!$tokenData) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    
    // Mark all notifications as read for this user
    if (in_array($tokenData['role'], ['admin', 'hr'])) {
        // Admin/HR: mark all notifications for their role
        $stmt = $mysqli->prepare("UPDATE notifications SET isRead = 1 WHERE recipientRole = ?");
        $stmt->bind_param("s", $tokenData['role']);
    } else {
        // Employee: mark all notifications for their user ID
        $stmt = $mysqli->prepare("UPDATE notifications SET isRead = 1 WHERE userId = ?");
        $stmt->bind_param("s", $tokenData['employeeId']);
    }
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'All notifications marked as read'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to mark notifications as read']);
    }
    exit;
}

// PUT /api/notifications/{id}/read - Mark notification as read
if (preg_match('#^/api/notifications/(\d+)/read$#', $path, $matches) && $_SERVER['REQUEST_METHOD'] === 'PUT') {
    if (!$mysqlConnected || !$mysqli) {
        http_response_code(503);
        echo json_encode(['error' => 'Database not available']);
        exit;
    }
    
    $notificationId = $matches[1];
    
    $stmt = $mysqli->prepare("UPDATE notifications SET isRead = 1, readAt = NOW() WHERE id = ?");
    $stmt->bind_param("i", $notificationId);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Notification marked as read'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update notification']);
    }
    exit;
}

// PUT /api/notifications/mark-all-read - Mark all notifications as read
if ($path === '/api/notifications/mark-all-read' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
    if (!$mysqlConnected || !$mysqli) {
        http_response_code(503);
        echo json_encode(['error' => 'Database not available']);
        exit;
    }
    
    // Check for authentication
    $authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $authMatches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $token = $authMatches[1];
    $tokenData = verifyToken($token);
    
    if (!$tokenData) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    
    $stmt = $mysqli->prepare(
        "UPDATE notifications SET isRead = 1, readAt = NOW() 
         WHERE (userId = ? OR recipientRole = ?) AND isRead = 0"
    );
    $stmt->bind_param("ss", $tokenData['username'], $tokenData['role']);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'All notifications marked as read',
            'count' => $stmt->affected_rows
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update notifications']);
    }
    exit;
}

// ==================== ATTENDANCE ENDPOINTS ====================

// GET /api/attendance - Get attendance records
if ($path === '/api/attendance' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!$mysqlConnected || !$mysqli) {
        http_response_code(503);
        echo json_encode(['error' => 'Database not available']);
        exit;
    }
    
    // Check for authentication
    $authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $authMatches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $token = $authMatches[1];
    $tokenData = verifyToken($token);
    
    if (!$tokenData) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    
    // Create attendance table if not exists
    $tableCheck = $mysqli->query("SHOW TABLES LIKE 'attendance'");
    if ($tableCheck->num_rows === 0) {
        $createTable = "CREATE TABLE attendance (
            id INT AUTO_INCREMENT PRIMARY KEY,
            employeeId VARCHAR(50) NOT NULL,
            date DATE NOT NULL,
            clockIn TIME,
            clockOut TIME,
            totalHours DECIMAL(4,2) DEFAULT 0,
            status ENUM('present', 'absent', 'late', 'half_day', 'overtime') DEFAULT 'present',
            notes TEXT,
            location VARCHAR(255),
            ipAddress VARCHAR(45),
            userAgent TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE,
            UNIQUE KEY unique_employee_date (employeeId, date)
        )";
        
        if (!$mysqli->query($createTable)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create attendance table: ' . $mysqli->error]);
            exit;
        }
    }
    
    // Get query parameters
    $employeeId = $_GET['employeeId'] ?? null;
    $startDate = $_GET['startDate'] ?? null;
    $endDate = $_GET['endDate'] ?? null;
    $limit = $_GET['limit'] ?? 50;
    $offset = $_GET['offset'] ?? 0;
    
    // Build query based on user role
    $whereClause = "1=1";
    $params = [];
    $types = "";
    
    // If not admin/hr, only show own records
    if (!in_array($tokenData['role'], ['admin', 'hr'])) {
        $whereClause .= " AND employeeId = ?";
        $params[] = $tokenData['employeeId'];
        $types .= "s";
    }
    
    // Filter by specific employee (admin/hr only)
    if ($employeeId && in_array($tokenData['role'], ['admin', 'hr'])) {
        $whereClause .= " AND employeeId = ?";
        $params[] = $employeeId;
        $types .= "s";
    }
    
    // Date range filter
    if ($startDate) {
        $whereClause .= " AND date >= ?";
        $params[] = $startDate;
        $types .= "s";
    }
    
    if ($endDate) {
        $whereClause .= " AND date <= ?";
        $params[] = $endDate;
        $types .= "s";
    }
    
    $sql = "SELECT * FROM attendance WHERE $whereClause ORDER BY date DESC, clockIn DESC LIMIT ? OFFSET ?";
    $params[] = (int)$limit;
    $params[] = (int)$offset;
    $types .= "ii";
    
    $stmt = $mysqli->prepare($sql);
    if ($params) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    $attendance = [];
    while ($row = $result->fetch_assoc()) {
        $attendance[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $attendance,
        'count' => count($attendance)
    ]);
    exit;
}

// POST /api/attendance/clock-in - Clock in
if ($path === '/api/attendance/clock-in' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!$mysqlConnected || !$mysqli) {
        http_response_code(503);
        echo json_encode(['error' => 'Database not available']);
        exit;
    }
    
    // Check for authentication
    $authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $authMatches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $token = $authMatches[1];
    $tokenData = verifyToken($token);
    
    if (!$tokenData) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $today = date('Y-m-d');
    $currentTime = date('H:i:s');
    $employeeId = $tokenData['employeeId'];
    
    // Check if already clocked in today
    $stmt = $mysqli->prepare("SELECT id, clockIn FROM attendance WHERE employeeId = ? AND date = ?");
    $stmt->bind_param("ss", $employeeId, $today);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $existing = $result->fetch_assoc();
        if ($existing['clockIn']) {
            sendJsonResponse(['error' => 'Already clocked in today'], 400);
        }
    }
    
    // Insert or update attendance record
    $location = $input['location'] ?? null;
    $notes = $input['notes'] ?? null;
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
    
    if ($result->num_rows > 0) {
        // Update existing record
        $stmt = $mysqli->prepare("UPDATE attendance SET clockIn = ?, location = ?, ipAddress = ?, userAgent = ?, notes = ? WHERE employeeId = ? AND date = ?");
        $stmt->bind_param("sssssss", $currentTime, $location, $ipAddress, $userAgent, $notes, $employeeId, $today);
    } else {
        // Insert new record
        $stmt = $mysqli->prepare("INSERT INTO attendance (employeeId, date, clockIn, location, ipAddress, userAgent, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'present')");
        $stmt->bind_param("sssssss", $employeeId, $today, $currentTime, $location, $ipAddress, $userAgent, $notes);
    }
    
    if ($stmt->execute()) {
        sendJsonResponse([
            'success' => true,
            'message' => 'Clocked in successfully',
            'data' => [
                'employeeId' => $employeeId,
                'date' => $today,
                'clockIn' => $currentTime,
                'location' => $location
            ]
        ]);
    } else {
        sendJsonResponse(['error' => 'Failed to clock in'], 500);
    }
    exit;
}

// POST /api/attendance/clock-out - Clock out
if ($path === '/api/attendance/clock-out' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!$mysqlConnected || !$mysqli) {
        http_response_code(503);
        echo json_encode(['error' => 'Database not available']);
        exit;
    }
    
    // Check for authentication
    $authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $authMatches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $token = $authMatches[1];
    $tokenData = verifyToken($token);
    
    if (!$tokenData) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $today = date('Y-m-d');
    $currentTime = date('H:i:s');
    $employeeId = $tokenData['employeeId'];
    
    // Check if clocked in today
    $stmt = $mysqli->prepare("SELECT id, clockIn, clockOut FROM attendance WHERE employeeId = ? AND date = ?");
    $stmt->bind_param("ss", $employeeId, $today);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Not clocked in today']);
        exit;
    }
    
    $attendance = $result->fetch_assoc();
    if ($attendance['clockOut']) {
        http_response_code(400);
        echo json_encode(['error' => 'Already clocked out today']);
        exit;
    }
    
    // Calculate total hours
    $clockIn = $attendance['clockIn'];
    $clockOut = $currentTime;
    $totalHours = calculateHours($clockIn, $clockOut);
    
    // Update attendance record
    $notes = $input['notes'] ?? null;
    $stmt = $mysqli->prepare("UPDATE attendance SET clockOut = ?, totalHours = ?, notes = ? WHERE employeeId = ? AND date = ?");
    $stmt->bind_param("sdsss", $clockOut, $totalHours, $notes, $employeeId, $today);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Clocked out successfully',
            'data' => [
                'employeeId' => $employeeId,
                'date' => $today,
                'clockIn' => $clockIn,
                'clockOut' => $clockOut,
                'totalHours' => $totalHours
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to clock out']);
    }
    exit;
}

// GET /api/attendance/status - Get current attendance status
if ($path === '/api/attendance/status' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!$mysqlConnected || !$mysqli) {
        http_response_code(503);
        echo json_encode(['error' => 'Database not available']);
        exit;
    }
    
    // Check for authentication
    $authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $authMatches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $token = $authMatches[1];
    $tokenData = verifyToken($token);
    
    if (!$tokenData) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    
    $today = date('Y-m-d');
    $employeeId = $tokenData['employeeId'];
    
    $stmt = $mysqli->prepare("SELECT clockIn, clockOut, totalHours, status FROM attendance WHERE employeeId = ? AND date = ?");
    $stmt->bind_param("ss", $employeeId, $today);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $attendance = $result->fetch_assoc();
        $status = 'clocked_out';
        if ($attendance['clockIn'] && !$attendance['clockOut']) {
            $status = 'clocked_in';
        }
        
        echo json_encode([
            'success' => true,
            'data' => [
                'status' => $status,
                'clockIn' => $attendance['clockIn'],
                'clockOut' => $attendance['clockOut'],
                'totalHours' => $attendance['totalHours'],
                'attendanceStatus' => $attendance['status']
            ]
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'data' => [
                'status' => 'not_clocked_in',
                'clockIn' => null,
                'clockOut' => null,
                'totalHours' => 0,
                'attendanceStatus' => null
            ]
        ]);
    }
    exit;
}

// Helper function to calculate hours between two times
function calculateHours($clockIn, $clockOut) {
    $start = strtotime($clockIn);
    $end = strtotime($clockOut);
    $hours = ($end - $start) / 3600;
    return round($hours, 2);
}

// If no route matched, return 404
http_response_code(404);
echo json_encode([
    'error' => 'Endpoint not found',
    'available_endpoints' => [
        'GET /api - API information',
        'GET /api/health - Server health check',
        'GET /api/test-users - Database connection test',
        'POST /api/auth/login - User login',
        'GET /api/auth/me - Get current user (requires token)',
        'POST /api/employees - Create employee (admin/hr only)',
        'GET /api/employees - Get all employees (requires auth)',
        'GET /api/leave-requests - Get leave requests',
        'POST /api/leave-requests - Submit leave request',
        'PUT /api/leave-requests/{id}/approve - Approve leave (admin/hr)',
        'PUT /api/leave-requests/{id}/reject - Reject leave (admin/hr)'
    ],
    'debug' => ['path' => $path, 'uri' => $requestUri],
    'tip' => 'Try /api/health, /api/auth/login, or /api/employees'
]);
