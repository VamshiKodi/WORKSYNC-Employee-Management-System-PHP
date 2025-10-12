<?php
/**
 * Update Rahul's Role to HR
 * Run this once by visiting: http://localhost/EMS/ems-backend-php/update-rahul-role.php
 */

header('Content-Type: text/html; charset=utf-8');

echo "<html><head><title>Update Rahul's Role to HR</title>";
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
echo "<h1>👤 Update Rahul's Role to HR</h1>";

// Connect to database
try {
    $mysqli = new mysqli('localhost', 'root', '', 'ems');
    
    if ($mysqli->connect_errno) {
        throw new Exception($mysqli->connect_error);
    }
    
    echo "<p class='info'>✅ Connected to database successfully</p>";
    
    // Search for Rahul's user record
    echo "<h3>Searching for Rahul's user account...</h3>";
    
    $result = $mysqli->query("SELECT * FROM users WHERE username LIKE '%rahul%' OR email LIKE '%rahul%'");
    
    if ($result && $result->num_rows > 0) {
        echo "<p class='info'>Found " . $result->num_rows . " user record(s) for Rahul:</p>";
        
        while ($row = $result->fetch_assoc()) {
            echo "<div class='record'>";
            echo "<strong>ID:</strong> {$row['id']} | ";
            echo "<strong>Username:</strong> {$row['username']} | ";
            echo "<strong>Current Role:</strong> {$row['role']} | ";
            echo "<strong>Employee ID:</strong> {$row['employeeId']} | ";
            echo "<strong>Email:</strong> {$row['email']}";
            echo "</div>";
            
            // Update role to 'hr'
            if ($row['role'] !== 'hr') {
                $updateStmt = $mysqli->prepare("UPDATE users SET role = 'hr' WHERE id = ?");
                $updateStmt->bind_param("i", $row['id']);
                
                if ($updateStmt->execute()) {
                    echo "<div class='record success'>✅ Updated {$row['username']}'s role from '{$row['role']}' to 'hr'</div>";
                } else {
                    echo "<div class='record error'>❌ Failed to update {$row['username']}'s role</div>";
                }
            } else {
                echo "<div class='record info'>ℹ️ {$row['username']} already has 'hr' role</div>";
            }
        }
        
        echo "<p class='success' style='margin-top: 20px; font-size: 18px;'>✅ Rahul now has HR permissions!</p>";
        echo "<p class='info'>Rahul can now:</p>";
        echo "<ul class='info'>";
        echo "<li>Add new employees</li>";
        echo "<li>Edit employee information</li>";
        echo "<li>Delete employees</li>";
        echo "<li>Access HR dashboard features</li>";
        echo "</ul>";
        
    } else {
        echo "<p class='error'>❌ No user records found for Rahul. Please check if the username is correct.</p>";
        echo "<p class='info'>Try searching for the exact username or check the database manually.</p>";
    }
    
    echo "<p class='info' style='margin-top: 20px;'>You can now delete this file: <code>update-rahul-role.php</code></p>";
    
    $mysqli->close();
    
} catch (Exception $e) {
    echo "<p class='error'>❌ Database Error: " . $e->getMessage() . "</p>";
}

echo "</div></body></html>";
?>
