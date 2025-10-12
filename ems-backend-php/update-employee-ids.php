<?php
/**
 * One-Time Script: Update Existing Employee IDs to Sequential Format (E001, E002, etc.)
 * 
 * Run this script once by visiting: http://localhost/EMS/ems-backend-php/update-employee-ids.php
 * After running, you can delete this file.
 */

header('Content-Type: text/html; charset=utf-8');

echo "<html><head><title>Update Employee IDs</title>";
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
    .employee { padding: 8px; margin: 5px 0; background: #f9f9f9; border-left: 3px solid #667eea; }
</style></head><body>";

echo "<div class='container'>";
echo "<h1>🔄 Update Employee IDs to Sequential Format</h1>";

// Connect to database
try {
    $mysqli = new mysqli('localhost', 'root', '', 'ems');
    
    if ($mysqli->connect_errno) {
        throw new Exception($mysqli->connect_error);
    }
    
    echo "<p class='info'>✅ Connected to database successfully</p>";
    
    // Disable foreign key checks temporarily
    $mysqli->query("SET FOREIGN_KEY_CHECKS=0");
    
    // Get all employees ordered by their original ID (creation order)
    $result = $mysqli->query("SELECT id, employeeId, firstName, lastName FROM employees ORDER BY id ASC");
    
    if (!$result) {
        throw new Exception("Failed to fetch employees: " . $mysqli->error);
    }
    
    $employees = [];
    while ($row = $result->fetch_assoc()) {
        $employees[] = $row;
    }
    
    echo "<p class='info'>Found " . count($employees) . " employees to update</p>";
    echo "<h3>Updating Employee IDs:</h3>";
    
    $counter = 1;
    $updated = 0;
    
    foreach ($employees as $emp) {
        $oldId = $emp['employeeId'];
        $newId = 'E' . str_pad($counter, 3, '0', STR_PAD_LEFT);
        
        // Update employees table
        $stmt = $mysqli->prepare("UPDATE employees SET employeeId = ? WHERE id = ?");
        $stmt->bind_param("si", $newId, $emp['id']);
        
        if ($stmt->execute()) {
            // Update users table
            $stmt2 = $mysqli->prepare("UPDATE users SET employeeId = ? WHERE employeeId = ?");
            $stmt2->bind_param("ss", $newId, $oldId);
            $stmt2->execute();
            
            echo "<div class='employee'>";
            echo "<strong>{$emp['firstName']} {$emp['lastName']}</strong>: ";
            echo "<span style='color: #999;'>{$oldId}</span> → <span style='color: #4caf50;'>{$newId}</span>";
            echo "</div>";
            
            $updated++;
        } else {
            echo "<div class='employee' style='border-left-color: #f44336;'>";
            echo "<span class='error'>Failed to update {$emp['firstName']} {$emp['lastName']}</span>";
            echo "</div>";
        }
        
        $counter++;
    }
    
    // Re-enable foreign key checks
    $mysqli->query("SET FOREIGN_KEY_CHECKS=1");
    
    echo "<p class='success' style='margin-top: 20px; font-size: 18px;'>✅ Successfully updated {$updated} employee IDs!</p>";
    echo "<p class='info'>You can now delete this file: <code>update-employee-ids.php</code></p>";
    
    $mysqli->close();
    
} catch (Exception $e) {
    echo "<p class='error'>❌ Error: " . $e->getMessage() . "</p>";
}

echo "</div></body></html>";
?>
