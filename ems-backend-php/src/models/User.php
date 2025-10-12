<?php

namespace EMS\Models;

use MongoDB\Collection;
use MongoDB\BSON\ObjectId;
use Respect\Validation\Validator as v;

class User
{
    private $collection;
    private $database;

    public function __construct($database)
    {
        $this->database = $database;
        $this->collection = $database->getCollection('users');
    }

    public function create($data)
    {
        // Validate required fields
        if (!v::key('username', v::stringType()->length(3, 30))->validate($data) ||
            !v::key('email', v::email())->validate($data) ||
            !v::key('password', v::stringType()->length(6, null))->validate($data)) {
            throw new \InvalidArgumentException('Invalid user data provided');
        }

        // Check if username or email already exists
        $existingUser = $this->collection->findOne([
            '$or' => [
                ['username' => $data['username']],
                ['email' => $data['email']]
            ]
        ]);

        if ($existingUser) {
            throw new \Exception('Username or email already exists');
        }

        // Hash password
        $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        $data['role'] = $data['role'] ?? 'employee';
        $data['isActive'] = $data['isActive'] ?? true;
        $data['createdAt'] = new \MongoDB\BSON\UTCDateTime();
        $data['updatedAt'] = new \MongoDB\BSON\UTCDateTime();

        $result = $this->collection->insertOne($data);

        return $this->findById($result->getInsertedId());
    }

    public function findById($id)
    {
        if ($id instanceof ObjectId) {
            $id = $id;
        } elseif (is_string($id)) {
            $id = new ObjectId($id);
        }

        return $this->collection->findOne(['_id' => $id]);
    }

    public function findByUsername($username)
    {
        return $this->collection->findOne(['username' => $username]);
    }

    public function findByEmail($email)
    {
        return $this->collection->findOne(['email' => $email]);
    }

    public function authenticate($username, $password)
    {
        $user = $this->collection->findOne([
            '$or' => [
                ['username' => $username],
                ['email' => $username]
            ],
            'isActive' => true
        ]);

        if (!$user || !password_verify($password, $user['password'])) {
            return false;
        }

        // Update last login
        $this->collection->updateOne(
            ['_id' => $user['_id']],
            ['$set' => ['lastLogin' => new \MongoDB\BSON\UTCDateTime()]]
        );

        return $this->sanitizeUser($user);
    }

    public function update($id, $data)
    {
        if ($id instanceof ObjectId) {
            $id = $id;
        } elseif (is_string($id)) {
            $id = new ObjectId($id);
        }

        $data['updatedAt'] = new \MongoDB\BSON\UTCDateTime();

        if (isset($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }

        $this->collection->updateOne(
            ['_id' => $id],
            ['$set' => $data]
        );

        return $this->findById($id);
    }

    public function delete($id)
    {
        if ($id instanceof ObjectId) {
            $id = $id;
        } elseif (is_string($id)) {
            $id = new ObjectId($id);
        }

        return $this->collection->deleteOne(['_id' => $id]);
    }

    public function getAll($limit = 50, $skip = 0)
    {
        return $this->collection->find([], [
            'limit' => $limit,
            'skip' => $skip
        ])->toArray();
    }

    public function sanitizeUser($user)
    {
        if (!$user) return null;

        // Remove password from user object
        $userArray = (array) $user;
        unset($userArray['password']);

        return $userArray;
    }
}
