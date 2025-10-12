<?php

namespace EMS\Helpers;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtHelper
{
    private static $secret;
    private static $algorithm = 'HS256';

    public static function encode($payload)
    {
        self::$secret = $_ENV['JWT_SECRET'] ?? 'your-secret-key';

        $issuedAt = time();
        $expiry = $_ENV['JWT_EXPIRY'] ?? 604800; // 7 days

        $token = [
            'iat' => $issuedAt,
            'exp' => $issuedAt + $expiry,
            'data' => $payload
        ];

        return JWT::encode($token, self::$secret, self::$algorithm);
    }

    public static function decode($token)
    {
        try {
            self::$secret = $_ENV['JWT_SECRET'] ?? 'your-secret-key';

            $decoded = JWT::decode($token, new Key(self::$secret, self::$algorithm));

            return (array) $decoded->data;
        } catch (\Exception $e) {
            return false;
        }
    }

    public static function validate($token)
    {
        return self::decode($token) !== false;
    }

    public static function getUserFromToken($token)
    {
        $decoded = self::decode($token);
        return $decoded ? $decoded['user'] : null;
    }
}
