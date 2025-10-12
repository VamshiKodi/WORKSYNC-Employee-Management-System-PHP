<?php

namespace EMS\Config;

use MongoDB\Client;
use Monolog\Logger;

class Database
{
    private $client;
    private $database;
    private $logger;

    public function __construct(Logger $logger = null)
    {
        $this->logger = $logger ?: new Logger('database');
    }

    public function connect()
    {
        try {
            $host = $_ENV['DB_HOST'] ?? 'localhost';
            $port = $_ENV['DB_PORT'] ?? '27017';
            $username = $_ENV['DB_USERNAME'] ?? '';
            $password = $_ENV['DB_PASSWORD'] ?? '';
            $databaseName = $_ENV['DB_NAME'] ?? 'ems_php';

            $connectionString = "mongodb://";

            if (!empty($username) && !empty($password)) {
                $connectionString .= "{$username}:{$password}@";
            }

            $connectionString .= "{$host}:{$port}";

            $this->client = new Client($connectionString);
            $this->database = $this->client->selectDatabase($databaseName);

            // Test connection
            $this->database->command(['ping' => 1]);

            $this->logger->info('Database connected successfully');

        } catch (\Exception $e) {
            $this->logger->error('Database connection failed: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getDatabase()
    {
        return $this->database;
    }

    public function getCollection($collectionName)
    {
        return $this->database->selectCollection($collectionName);
    }
}
