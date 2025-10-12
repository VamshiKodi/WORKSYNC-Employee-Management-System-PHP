<?php

namespace EMS\Middleware;

use EMS\Helpers\JwtHelper;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as Handler;
use Slim\Psr7\Response;

class AuthMiddleware
{
    public function __invoke(Request $request, Handler $handler)
    {
        $response = new Response();

        // Get authorization header
        $authHeader = $request->getHeader('Authorization');

        if (empty($authHeader)) {
            $response->getBody()->write(json_encode(['error' => 'Authorization header required']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        // Extract token from header
        $token = str_replace('Bearer ', '', $authHeader[0]);

        if (empty($token)) {
            $response->getBody()->write(json_encode(['error' => 'Token required']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        // Validate token
        if (!JwtHelper::validate($token)) {
            $response->getBody()->write(json_encode(['error' => 'Invalid token']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        // Add user info to request attributes
        $user = JwtHelper::getUserFromToken($token);
        $request = $request->withAttribute('user', $user);

        return $handler->handle($request);
    }
}

class AdminAuthMiddleware extends AuthMiddleware
{
    public function __invoke(Request $request, Handler $handler)
    {
        $response = new Response();

        // First validate the token
        $authHeader = $request->getHeader('Authorization');

        if (empty($authHeader)) {
            $response->getBody()->write(json_encode(['error' => 'Authorization header required']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        $token = str_replace('Bearer ', '', $authHeader[0]);

        if (empty($token) || !JwtHelper::validate($token)) {
            $response->getBody()->write(json_encode(['error' => 'Invalid token']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        // Check if user is admin
        $user = JwtHelper::getUserFromToken($token);

        if (!$user || $user['role'] !== 'admin') {
            $response->getBody()->write(json_encode(['error' => 'Admin access required']));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }

        $request = $request->withAttribute('user', $user);

        return $handler->handle($request);
    }
}
