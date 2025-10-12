<?php
/**
 * Quick Routing Test
 */

// Simulate the routing logic
$requestUri = '/EMS/ems-backend-php/api/health';
$uriParts = explode('?', $requestUri);
$path = rtrim($uriParts[0], '/');

// Remove the base path if present
$basePath = '/EMS/ems-backend-php';
if (strpos($path, $basePath) === 0) {
    $path = substr($path, strlen($basePath));
}
$path = rtrim($path, '/') ?: '/';

echo "<h1>Routing Test</h1>";
echo "<p><strong>Original URI:</strong> $requestUri</p>";
echo "<p><strong>Processed Path:</strong> $path</p>";

if ($path === '/api/health') {
    echo "<p style='color: green;'><strong>✅ Routing Fixed!</strong> Path matches correctly.</p>";
} else {
    echo "<p style='color: red;'><strong>❌ Still broken.</strong> Expected '/api/health', got '$path'</p>";
}

echo "<h2>Test URLs:</h2>";
echo "<ul>";
echo "<li><a href='/EMS/ems-backend-php/api/health'>Health Check</a></li>";
echo "<li><a href='/EMS/ems-backend-php/api/employees'>Employees (needs auth)</a></li>";
echo "<li><a href='/EMS/ems-backend-php/test-employee-api.html'>Test Page</a></li>";
echo "</ul>";
?>
