<?php
// Quick fix for Virat's employeeId
$mysqli = new mysqli('localhost', 'root', '', 'ems');

if ($mysqli->connect_errno) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Update virat's employeeId from E006 to E005
$result = $mysqli->query("UPDATE users SET employeeId = 'E005' WHERE username = 'virat'");

if ($result) {
    echo "SUCCESS: Virat's employeeId updated from E006 to E005\n";
    echo "Now logout and login again as virat, then submit a new leave request.\n";
} else {
    echo "ERROR: " . $mysqli->error;
}

$mysqli->close();
?>
