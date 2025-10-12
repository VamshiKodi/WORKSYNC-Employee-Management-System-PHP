<?php
// Simple Database Viewer for EMS
// Alternative to phpMyAdmin when it's unstable

$host = '127.0.0.1';
$port = '3307';
$username = 'root';
$password = '';
$database = 'ems';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h1>EMS Database Viewer</h1>";
    echo "<p>Connected to MySQL on port $port</p>";
    
    // Show tables
    echo "<h2>Tables in EMS Database:</h2>";
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($tables as $table) {
        echo "<h3>Table: $table</h3>";
        
        // Show table structure
        $stmt = $pdo->query("DESCRIBE $table");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<table border='1' style='border-collapse: collapse; margin: 10px 0;'>";
        echo "<tr><th>Column</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th></tr>";
        foreach ($columns as $column) {
            echo "<tr>";
            echo "<td>{$column['Field']}</td>";
            echo "<td>{$column['Type']}</td>";
            echo "<td>{$column['Null']}</td>";
            echo "<td>{$column['Key']}</td>";
            echo "<td>{$column['Default']}</td>";
            echo "</tr>";
        }
        echo "</table>";
        
        // Show sample data (first 5 rows)
        $stmt = $pdo->query("SELECT * FROM $table LIMIT 5");
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (!empty($data)) {
            echo "<h4>Sample Data (first 5 rows):</h4>";
            echo "<table border='1' style='border-collapse: collapse; margin: 10px 0;'>";
            
            // Headers
            echo "<tr>";
            foreach (array_keys($data[0]) as $header) {
                echo "<th>$header</th>";
            }
            echo "</tr>";
            
            // Data
            foreach ($data as $row) {
                echo "<tr>";
                foreach ($row as $value) {
                    echo "<td>" . htmlspecialchars($value) . "</td>";
                }
                echo "</tr>";
            }
            echo "</table>";
        }
        
        echo "<hr>";
    }
    
} catch (PDOException $e) {
    echo "<h1>Connection Error</h1>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
    echo "<p>Make sure MySQL is running on port $port</p>";
}
?>

<style>
body { font-family: Arial, sans-serif; margin: 20px; }
table { width: 100%; }
th, td { padding: 8px; text-align: left; }
th { background-color: #f2f2f2; }
</style>
