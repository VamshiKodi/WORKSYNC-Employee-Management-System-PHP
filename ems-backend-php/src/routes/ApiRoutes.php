<?php

namespace EMS\Routes;

use Slim\App;
use EMS\Controllers\AuthController;
use EMS\Controllers\EmployeeController;
use EMS\Middleware\AuthMiddleware;
use EMS\Middleware\AdminAuthMiddleware;

class ApiRoutes
{
    private $app;
    private $logger;

    public function __construct(App $app, $logger = null)
    {
        $this->app = $app;
        $this->logger = $logger;
    }

    public function register()
    {
        // Initialize controllers with database
        $database = $this->app->getContainer()->get('database');
        $authController = new AuthController($database);
        $employeeController = new EmployeeController($database);

        // Authentication routes (public)
        $this->app->post('/api/auth/login', [$authController, 'login']);
        $this->app->post('/api/auth/register', [$authController, 'register']);

        // Protected routes
        $this->app->get('/api/auth/me', [$authController, 'me'])->add(new AuthMiddleware());

        // Employee routes
        $this->app->get('/api/employees', [$employeeController, 'getAll'])->add(new AuthMiddleware());
        $this->app->get('/api/employees/{id}', [$employeeController, 'getById'])->add(new AuthMiddleware());
        $this->app->post('/api/employees', [$employeeController, 'create'])->add(new AdminAuthMiddleware());
        $this->app->put('/api/employees/{id}', [$employeeController, 'update'])->add(new AdminAuthMiddleware());
        $this->app->delete('/api/employees/{id}', [$employeeController, 'delete'])->add(new AdminAuthMiddleware());

        // Employee statistics (admin only)
        $this->app->get('/api/employees/statistics', [$employeeController, 'getStatistics'])->add(new AdminAuthMiddleware());

        // Health check endpoint
        $this->app->get('/api/health', function($request, $response) {
            $response->getBody()->write(json_encode([
                'status' => 'OK',
                'message' => 'EMS PHP API is running'
            ]));
            return $response->withHeader('Content-Type', 'application/json');
        });

        // Test users endpoint for debugging
        $this->app->get('/api/test-users', function($request, $response) use ($database) {
            try {
                $collection = $database->getCollection('users');
                $users = $collection->find()->toArray();

                $response->getBody()->write(json_encode($users));
                return $response->withHeader('Content-Type', 'application/json');
            } catch (\Exception $e) {
                $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
                return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
            }
        });
    }
}
