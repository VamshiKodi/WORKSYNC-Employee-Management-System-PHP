<?php
// Simple test file to verify PHP web server is working
echo "<h1>PHP Server Test</h1>";
echo "<p>Current time: " . date('Y-m-d H:i:s') . "</p>";
echo "<p>Server info: " . $_SERVER['SERVER_SOFTWARE'] . "</p>";
echo "<p>Request URI: " . $_SERVER['REQUEST_URI'] . "</p>";
echo "<p>Script name: " . $_SERVER['SCRIPT_NAME'] . "</p>";

if ($_SERVER['REQUEST_URI'] === '/api/health') {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'OK',
        'message' => 'PHP Server is working!',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit;
}

echo "<p><a href='/api/health'>Test API Health</a></p>";
?>
