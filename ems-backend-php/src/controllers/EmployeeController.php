<?php

namespace EMS\Controllers;

use EMS\Models\Employee;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use Respect\Validation\Validator as v;

class EmployeeController
{
    private $employeeModel;

    public function __construct($database)
    {
        $this->employeeModel = new Employee($database);
    }

    public function getAll(Request $request, Response $response)
    {
        try {
            $params = $request->getQueryParams();

            $filters = [];
            if (isset($params['department'])) {
                $filters['department'] = $params['department'];
            }
            if (isset($params['status'])) {
                $filters['status'] = $params['status'];
            }
            if (isset($params['search'])) {
                $filters['search'] = $params['search'];
            }

            $limit = isset($params['limit']) ? (int)$params['limit'] : 50;
            $skip = isset($params['skip']) ? (int)$params['skip'] : 0;

            $employees = $this->employeeModel->getAll($filters, $limit, $skip);

            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $employees,
                'count' => count($employees)
            ]));

            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'error' => 'Failed to fetch employees: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getById(Request $request, Response $response, $args)
    {
        try {
            $employee = $this->employeeModel->findById($args['id']);

            if (!$employee) {
                $response->getBody()->write(json_encode([
                    'error' => 'Employee not found'
                ]));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }

            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $employee
            ]));

            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'error' => 'Failed to fetch employee: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function create(Request $request, Response $response)
    {
        try {
            $data = json_decode($request->getBody()->getContents(), true);

            // Validate required fields
            if (!v::key('firstName', v::stringType())->validate($data) ||
                !v::key('lastName', v::stringType())->validate($data) ||
                !v::key('email', v::email())->validate($data) ||
                !v::key('department', v::stringType())->validate($data) ||
                !v::key('position', v::stringType())->validate($data)) {
                $response->getBody()->write(json_encode([
                    'error' => 'First name, last name, email, department, and position are required'
                ]));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }

            $employee = $this->employeeModel->create($data);

            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $employee
            ]));

            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'error' => 'Failed to create employee: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function update(Request $request, Response $response, $args)
    {
        try {
            $data = json_decode($request->getBody()->getContents(), true);

            $employee = $this->employeeModel->update($args['id'], $data);

            if (!$employee) {
                $response->getBody()->write(json_encode([
                    'error' => 'Employee not found'
                ]));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }

            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $employee
            ]));

            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'error' => 'Failed to update employee: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function delete(Request $request, Response $response, $args)
    {
        try {
            $result = $this->employeeModel->delete($args['id']);

            if ($result->getDeletedCount() === 0) {
                $response->getBody()->write(json_encode([
                    'error' => 'Employee not found'
                ]));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }

            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Employee deleted successfully'
            ]));

            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'error' => 'Failed to delete employee: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function getStatistics(Request $request, Response $response)
    {
        try {
            $stats = $this->employeeModel->getStatistics();

            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $stats
            ]));

            return $response->withHeader('Content-Type', 'application/json');

        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'error' => 'Failed to fetch statistics: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
}
