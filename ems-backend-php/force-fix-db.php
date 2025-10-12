<?php
/**
 * Force Fix Database Connection
 * This will update index.php with a working connection
 */

$indexPath = __DIR__ . '/index.php';
$content = file_get_contents($indexPath);

// Find and replace the database connection section
$oldConnection = '/try \{.*?error_log\("MySQL connection failed: " \. \$e->getMessage\(\)\);.*?\}/s';

$newConnection = 'try {
    if (extension_loaded(\'mysqli\')) {
        $mysqli = new mysqli(\'localhost\', \'root\', \'\', \'ems\');
        
        if ($mysqli->connect_error) {
            // Create database if it doesn\'t exist
            $mysqli_temp = new mysqli(\'localhost\', \'root\', \'\');
            $mysqli_temp->query("CREATE DATABASE IF NOT EXISTS ems");
            $mysqli_temp->close();
            
            // Try again
            $mysqli = new mysqli(\'localhost\', \'root\', \'\', \'ems\');
        }
        
        if (!$mysqli->connect_error) {
            $mysqli->set_charset(\'utf8\');
            $mysqlConnected = true;
        }
    }
} catch (Exception $e) {
    error_log("MySQL connection failed: " . $e->getMessage());
}';

$newContent = preg_replace($oldConnection, $newConnection, $content);

if ($newContent !== $content) {
    file_put_contents($indexPath, $newContent);
    echo "<h1>✅ Database Connection Fixed!</h1>";
    echo "<p>The connection logic has been updated.</p>";
    echo "<p><a href='test-employee-api.html'>Test the API now</a></p>";
} else {
    echo "<h1>⚠️ Could not auto-fix</h1>";
    echo "<p>Manual fix needed. Check the debug connection first.</p>";
    echo "<p><a href='api/debug-connection'>Debug Connection</a></p>";
}
?>
