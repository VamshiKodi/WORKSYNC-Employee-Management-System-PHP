<?php

namespace EMS\Controllers;

use EMS\Models\User;
use EMS\Helpers\JwtHelper;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use Respect\Validation\Validator as v;

class AuthController
{
    private $userModel;

    public function __construct($database)
    {
        $this->userModel = new User($database);
    }

    public function login(Request $request, Response $response)
    {
        try {
            $data = json_decode($request->getBody()->getContents(), true);

            // Validate input
            if (!v::key('username', v::stringType())->validate($data) ||
                !v::key('password', v::stringType())->validate($data)) {
                $response->getBody()->write(json_encode([
                    'error' => 'Username and password are required'
                ]));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            // Authenticate user
            $user = $this->userModel->authenticate($data['username'], $data['password']);

            if (!$user) {
                $response->getBody()->write(json_encode([
                    'error' => 'Invalid credentials'
                ]));
                return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
            }

            // Generate JWT token
            $token = JwtHelper::encode(['user' => $user]);

            $response->getBody()->write(json_encode([
                'success' => true,
                'token' => $token,
                'user' => $this->userModel->sanitizeUser($user)
            ]));

            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'error' => 'Login failed: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function register(Request $request, Response $response)
    {
        try {
            $data = json_decode($request->getBody()->getContents(), true);

            // Validate input
            if (!v::key('username', v::stringType()->length(3, 30))->validate($data) ||
                !v::key('email', v::email())->validate($data) ||
                !v::key('password', v::stringType()->length(6, null))->validate($data)) {
                $response->getBody()->write(json_encode([
                    'error' => 'Valid username, email, and password are required'
                ]));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            // Create user
            $user = $this->userModel->create($data);

            // Generate token
            $token = JwtHelper::encode(['user' => $this->userModel->sanitizeUser($user)]);

            $response->getBody()->write(json_encode([
                'success' => true,
                'token' => $token,
                'user' => $this->userModel->sanitizeUser($user)
            ]));

            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'error' => 'Registration failed: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function me(Request $request, Response $response)
    {
        try {
            $user = $request->getAttribute('user');

            if (!$user) {
                $response->getBody()->write(json_encode([
                    'error' => 'User not authenticated'
                ]));
                return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
            }

            $response->getBody()->write(json_encode([
                'success' => true,
                'user' => $user
            ]));

            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'error' => 'Failed to get user info: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
}
