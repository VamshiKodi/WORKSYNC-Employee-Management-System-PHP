<?php

// Simple autoloader for EMS PHP Backend
// This replaces Composer autoloading for quick testing

spl_autoload_register(function ($className) {
    // Convert namespace to file path
    $className = str_replace('\\', '/', $className);
    $filePath = __DIR__ . '/src/' . $className . '.php';

    if (file_exists($filePath)) {
        require_once $filePath;
    }
});

// Manual includes for core dependencies (if they exist)
$deps = [
    __DIR__ . '/vendor/autoload.php',  // If Composer worked
];

foreach ($deps as $dep) {
    if (file_exists($dep)) {
        require_once $dep;
        break;
    }
}
