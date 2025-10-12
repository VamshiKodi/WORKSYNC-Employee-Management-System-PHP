<?php

namespace EMS\Models;

use MongoDB\Collection;
use MongoDB\BSON\ObjectId;
use Respect\Validation\Validator as v;

class Employee
{
    private $collection;
    private $database;

    public function __construct($database)
    {
        $this->database = $database;
        $this->collection = $database->getCollection('employees');
    }

    public function create($data)
    {
        // Validate required fields
        if (!v::key('firstName', v::stringType())->validate($data) ||
            !v::key('lastName', v::stringType())->validate($data) ||
            !v::key('email', v::email())->validate($data) ||
            !v::key('department', v::stringType())->validate($data) ||
            !v::key('position', v::stringType())->validate($data)) {
            throw new \InvalidArgumentException('Invalid employee data provided');
        }

        // Check if email already exists
        $existingEmployee = $this->collection->findOne(['email' => $data['email']]);
        if ($existingEmployee) {
            throw new \Exception('Employee with this email already exists');
        }

        // Generate employee ID if not provided
        if (!isset($data['employeeId'])) {
            $data['employeeId'] = 'EMP' . time() . rand(100, 999);
        }

        $data['hireDate'] = $data['hireDate'] ?? new \MongoDB\BSON\UTCDateTime();
        $data['salary'] = $data['salary'] ?? 0;
        $data['status'] = $data['status'] ?? 'active';
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

    public function findByEmployeeId($employeeId)
    {
        return $this->collection->findOne(['employeeId' => $employeeId]);
    }

    public function update($id, $data)
    {
        if ($id instanceof ObjectId) {
            $id = $id;
        } elseif (is_string($id)) {
            $id = new ObjectId($id);
        }

        $data['updatedAt'] = new \MongoDB\BSON\UTCDateTime();

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

    public function getAll($filters = [], $limit = 50, $skip = 0)
    {
        $query = [];

        if (isset($filters['department'])) {
            $query['department'] = $filters['department'];
        }

        if (isset($filters['status'])) {
            $query['status'] = $filters['status'];
        }

        if (isset($filters['search'])) {
            $query['$text'] = ['$search' => $filters['search']];
        }

        return $this->collection->find($query, [
            'limit' => $limit,
            'skip' => $skip
        ])->toArray();
    }

    public function getByDepartment($department)
    {
        return $this->collection->find(['department' => $department])->toArray();
    }

    public function getStatistics()
    {
        $pipeline = [
            [
                '$group' => [
                    '_id' => '$department',
                    'count' => ['$sum' => 1],
                    'avgSalary' => ['$avg' => '$salary']
                ]
            ]
        ];

        return $this->collection->aggregate($pipeline)->toArray();
    }

    public function getFullName($employee)
    {
        return $employee['firstName'] . ' ' . $employee['lastName'];
    }
}
