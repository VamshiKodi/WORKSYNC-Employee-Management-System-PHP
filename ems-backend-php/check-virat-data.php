<?php
/**
 * Check Virat's User and Employee Data
 */

header('Content-Type: text/html; charset=utf-8');

echo "<html><head><title>Check Virat's Data</title>";
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
    .record { padding: 10px; margin: 5px 0; background: #f9f9f9; border-left: 3px solid #667eea; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #667eea; color: white; }
</style></head><body>";

echo "<div class='container'>";
echo "<h1>🔍 Check Virat's Data</h1>";

try {
    $mysqli = new mysqli('localhost', 'root', '', 'ems');
    
    if ($mysqli->connect_errno) {
        throw new Exception($mysqli->connect_error);
    }
    
    echo "<p class='info'>✅ Connected to database successfully</p>";
    
    // Check users table for virat
    echo "<h3>1. Checking Users Table for 'virat':</h3>";
    $userResult = $mysqli->query("SELECT * FROM users WHERE username LIKE '%virat%' OR email LIKE '%virat%'");
    
    if ($userResult && $userResult->num_rows > 0) {
        echo "<table>";
        echo "<tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Employee ID</th></tr>";
        while ($row = $userResult->fetch_assoc()) {
            echo "<tr>";
            echo "<td>{$row['id']}</td>";
            echo "<td>{$row['username']}</td>";
            echo "<td>{$row['email']}</td>";
            echo "<td>{$row['role']}</td>";
            echo "<td><strong>{$row['employeeId']}</strong></td>";
            echo "</tr>";
            
            $viratEmployeeId = $row['employeeId'];
        }
        echo "</table>";
    } else {
        echo "<p class='error'>❌ No user found with username 'virat'</p>";
    }
    
    // Check employees table
    echo "<h3>2. Checking Employees Table:</h3>";
    
    if (isset($viratEmployeeId)) {
        echo "<p class='info'>Looking for employee with ID: <strong>{$viratEmployeeId}</strong></p>";
        
        $empStmt = $mysqli->prepare("SELECT * FROM employees WHERE employeeId = ?");
        $empStmt->bind_param("s", $viratEmployeeId);
        $empStmt->execute();
        $empResult = $empStmt->get_result();
        
        if ($empResult->num_rows > 0) {
            $emp = $empResult->fetch_assoc();
            echo "<div class='success'>";
            echo "<h4>✅ Employee Found:</h4>";
            echo "<p><strong>Name:</strong> {$emp['firstName']} {$emp['lastName']}</p>";
            echo "<p><strong>Employee ID:</strong> {$emp['employeeId']}</p>";
            echo "<p><strong>Email:</strong> {$emp['email']}</p>";
            echo "<p><strong>Department:</strong> {$emp['department']}</p>";
            echo "<p><strong>Position:</strong> {$emp['position']}</p>";
            echo "</div>";
        } else {
            echo "<div class='error'>";
            echo "<h4>❌ Employee NOT Found!</h4>";
            echo "<p>The user 'virat' has employeeId '{$viratEmployeeId}' but no matching employee record exists.</p>";
            echo "<p><strong>Solution:</strong> Either:</p>";
            echo "<ul>";
            echo "<li>Create an employee record with employeeId '{$viratEmployeeId}'</li>";
            echo "<li>Or update the user's employeeId to match an existing employee</li>";
            echo "</ul>";
            echo "</div>";
        }
    }
    
    // Check all employees named virat or rohit
    echo "<h3>3. All Employees with 'virat' or 'rohit' in name:</h3>";
    $allEmpResult = $mysqli->query("SELECT * FROM employees WHERE firstName LIKE '%virat%' OR lastName LIKE '%virat%' OR firstName LIKE '%rohit%' OR lastName LIKE '%rohit%'");
    
    if ($allEmpResult && $allEmpResult->num_rows > 0) {
        echo "<table>";
        echo "<tr><th>ID</th><th>Employee ID</th><th>Name</th><th>Email</th><th>Department</th></tr>";
        while ($row = $allEmpResult->fetch_assoc()) {
            echo "<tr>";
            echo "<td>{$row['id']}</td>";
            echo "<td><strong>{$row['employeeId']}</strong></td>";
            echo "<td>{$row['firstName']} {$row['lastName']}</td>";
            echo "<td>{$row['email']}</td>";
            echo "<td>{$row['department']}</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p class='info'>No employees found with 'virat' or 'rohit' in their name</p>";
    }
    
    // Check recent leave requests
    echo "<h3>4. Recent Leave Requests:</h3>";
    $leaveResult = $mysqli->query("SELECT * FROM leave_requests ORDER BY createdAt DESC LIMIT 5");
    
    if ($leaveResult && $leaveResult->num_rows > 0) {
        echo "<table>";
        echo "<tr><th>ID</th><th>Employee ID</th><th>Employee Name</th><th>Leave Type</th><th>Status</th><th>Created</th></tr>";
        while ($row = $leaveResult->fetch_assoc()) {
            echo "<tr>";
            echo "<td>{$row['id']}</td>";
            echo "<td><strong>{$row['employeeId']}</strong></td>";
            echo "<td>{$row['employeeName']}</td>";
            echo "<td>{$row['leaveType']}</td>";
            echo "<td>{$row['status']}</td>";
            echo "<td>{$row['createdAt']}</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
    
    $mysqli->close();
    
} catch (Exception $e) {
    echo "<p class='error'>❌ Database Error: " . $e->getMessage() . "</p>";
}

echo "</div></body></html>";
?>
