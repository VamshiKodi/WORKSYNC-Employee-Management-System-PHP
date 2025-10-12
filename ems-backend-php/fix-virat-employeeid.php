<?php
/**
 * Fix Virat's Employee ID
 */

header('Content-Type: text/html; charset=utf-8');

echo "<html><head><title>Fix Virat's Employee ID</title>";
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
    .success { color: #4caf50; font-weight: bold; padding: 10px; background: #e8f5e9; border-radius: 4px; margin: 10px 0; }
    .error { color: #f44336; font-weight: bold; padding: 10px; background: #ffebee; border-radius: 4px; margin: 10px 0; }
    .info { color: #666; margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; }
</style></head><body>";

echo "<div class='container'>";
echo "<h1>🔧 Fix Virat's Employee ID</h1>";

try {
    $mysqli = new mysqli('localhost', 'root', '', 'ems');
    
    if ($mysqli->connect_errno) {
        throw new Exception($mysqli->connect_error);
    }
    
    echo "<p class='info'>✅ Connected to database successfully</p>";
    
    echo "<h3>Current Situation:</h3>";
    echo "<div class='info'>";
    echo "<p>❌ <strong>Problem:</strong> User 'virat' has employeeId = E006 (which belongs to Rohit Sharma)</p>";
    echo "<p>✅ <strong>Solution:</strong> Update user 'virat' to use employeeId = E005 (which is Virat Kohli's record)</p>";
    echo "</div>";
    
    // Update virat's employeeId
    echo "<h3>Updating...</h3>";
    
    $stmt = $mysqli->prepare("UPDATE users SET employeeId = 'E005' WHERE username = 'virat'");
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo "<div class='success'>";
            echo "<h4>✅ Successfully Updated!</h4>";
            echo "<p>User 'virat' now has the correct employeeId: <strong>E005</strong></p>";
            echo "</div>";
            
            // Verify the update
            $verifyResult = $mysqli->query("SELECT u.username, u.employeeId, e.firstName, e.lastName 
                                           FROM users u 
                                           LEFT JOIN employees e ON u.employeeId = e.employeeId 
                                           WHERE u.username = 'virat'");
            
            if ($verifyResult && $verifyResult->num_rows > 0) {
                $row = $verifyResult->fetch_assoc();
                echo "<div class='success'>";
                echo "<h4>Verification:</h4>";
                echo "<p><strong>Username:</strong> {$row['username']}</p>";
                echo "<p><strong>Employee ID:</strong> {$row['employeeId']}</p>";
                echo "<p><strong>Linked Employee:</strong> {$row['firstName']} {$row['lastName']}</p>";
                echo "</div>";
            }
            
            echo "<div class='info'>";
            echo "<h4>✅ What's Fixed:</h4>";
            echo "<ul>";
            echo "<li>Virat can now login and his name will show correctly</li>";
            echo "<li>Leave requests from Virat will show 'Virat Kohli' instead of 'Rohit Sharma'</li>";
            echo "<li>Profile page will show correct employee information</li>";
            echo "</ul>";
            echo "<p><strong>Next Steps:</strong></p>";
            echo "<ol>";
            echo "<li>Logout from the app</li>";
            echo "<li>Login again as 'virat'</li>";
            echo "<li>Submit a new leave request</li>";
            echo "<li>It should now show 'Virat Kohli' correctly</li>";
            echo "</ol>";
            echo "</div>";
            
        } else {
            echo "<p class='info'>No changes needed - employeeId might already be correct</p>";
        }
    } else {
        throw new Exception("Failed to update: " . $mysqli->error);
    }
    
    $mysqli->close();
    
} catch (Exception $e) {
    echo "<p class='error'>❌ Error: " . $e->getMessage() . "</p>";
}

echo "<p class='info' style='margin-top: 20px;'>You can delete this file after successful fix: <code>fix-virat-employeeid.php</code></p>";
echo "</div></body></html>";
?>
