<?php
/**
 * Cleanup Script: Delete Rohit Sharma Record
 * Run this once by visiting: http://localhost/EMS/ems-backend-php/cleanup-rohit.php
 */

header('Content-Type: text/html; charset=utf-8');

echo "<html><head><title>Cleanup Rohit Sharma Record</title>";
echo "<style>
    body { 
        font-family: Arial, sans-serif; 
        padding: 20px; 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
    }
    .container { 
        max-width: 800px; 
        margin: 0 auto; 
        background: white; 
        padding: 30px; 
        border-radius: 10px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    h1 { color: #667eea; margin-bottom: 20px; }
    .success { color: #4caf50; font-weight: bold; }
    .error { color: #f44336; font-weight: bold; }
    .info { color: #666; margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; }
    .record { padding: 8px; margin: 5px 0; background: #f9f9f9; border-left: 3px solid #667eea; }
</style></head><body>";

echo "<div class='container'>";
echo "<h1>🧹 Cleanup Rohit Sharma Record</h1>";

// Connect to database
try {
    $mysqli = new mysqli('localhost', 'root', '', 'ems');
    
    if ($mysqli->connect_errno) {
        throw new Exception($mysqli->connect_error);
    }
    
    echo "<p class='info'>✅ Connected to database successfully</p>";
    
    // Search for Rohit Sharma records
    echo "<h3>Searching for Rohit Sharma records...</h3>";
    
    // Check employees table
    $result = $mysqli->query("SELECT * FROM employees WHERE firstName LIKE '%rohit%' OR lastName LIKE '%sharma%' OR CONCAT(firstName, ' ', lastName) LIKE '%rohit sharma%'");
    
    $employeesToDelete = [];
    if ($result && $result->num_rows > 0) {
        echo "<p class='info'>Found " . $result->num_rows . " employee record(s):</p>";
        while ($row = $result->fetch_assoc()) {
            $employeesToDelete[] = $row;
            echo "<div class='record'>";
            echo "<strong>ID:</strong> {$row['id']} | ";
            echo "<strong>Employee ID:</strong> {$row['employeeId']} | ";
            echo "<strong>Name:</strong> {$row['firstName']} {$row['lastName']} | ";
            echo "<strong>Email:</strong> {$row['email']}";
            echo "</div>";
        }
    } else {
        echo "<p class='info'>No employee records found for Rohit Sharma</p>";
    }
    
    // Check users table
    $userResult = $mysqli->query("SELECT * FROM users WHERE username LIKE '%rohit%' OR email LIKE '%rohit%'");
    
    $usersToDelete = [];
    if ($userResult && $userResult->num_rows > 0) {
        echo "<p class='info'>Found " . $userResult->num_rows . " user record(s):</p>";
        while ($row = $userResult->fetch_assoc()) {
            $usersToDelete[] = $row;
            echo "<div class='record'>";
            echo "<strong>ID:</strong> {$row['id']} | ";
            echo "<strong>Username:</strong> {$row['username']} | ";
            echo "<strong>Employee ID:</strong> {$row['employeeId']} | ";
            echo "<strong>Email:</strong> {$row['email']}";
            echo "</div>";
        }
    } else {
        echo "<p class='info'>No user records found for Rohit</p>";
    }
    
    // Delete the records if found
    if (!empty($employeesToDelete) || !empty($usersToDelete)) {
        echo "<h3>Deleting Records...</h3>";
        
        $mysqli->begin_transaction();
        
        try {
            $deletedUsers = 0;
            $deletedEmployees = 0;
            
            // Delete users first
            foreach ($usersToDelete as $user) {
                $stmt = $mysqli->prepare("DELETE FROM users WHERE id = ?");
                $stmt->bind_param("i", $user['id']);
                if ($stmt->execute()) {
                    echo "<div class='record success'>✅ Deleted user: {$user['username']} (ID: {$user['id']})</div>";
                    $deletedUsers++;
                }
            }
            
            // Delete employees
            foreach ($employeesToDelete as $employee) {
                $stmt = $mysqli->prepare("DELETE FROM employees WHERE id = ?");
                $stmt->bind_param("i", $employee['id']);
                if ($stmt->execute()) {
                    echo "<div class='record success'>✅ Deleted employee: {$employee['firstName']} {$employee['lastName']} (ID: {$employee['id']})</div>";
                    $deletedEmployees++;
                }
            }
            
            $mysqli->commit();
            
            echo "<p class='success' style='margin-top: 20px; font-size: 18px;'>✅ Successfully deleted {$deletedUsers} user record(s) and {$deletedEmployees} employee record(s)!</p>";
            echo "<p class='info'>Rohit Sharma has been completely removed from the database.</p>";
            
        } catch (Exception $e) {
            $mysqli->rollback();
            echo "<p class='error'>❌ Error during deletion: " . $e->getMessage() . "</p>";
        }
    } else {
        echo "<p class='info'>No records found to delete. Rohit Sharma may have already been cleaned up.</p>";
    }
    
    echo "<p class='info' style='margin-top: 20px;'>You can now delete this cleanup file: <code>cleanup-rohit.php</code></p>";
    
    $mysqli->close();
    
} catch (Exception $e) {
    echo "<p class='error'>❌ Database Error: " . $e->getMessage() . "</p>";
}

echo "</div></body></html>";
?>
