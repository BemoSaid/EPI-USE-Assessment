import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const employeeController = new EmployeeController();

// All routes require authentication
router.use(authenticateToken);

router.get('/', employeeController.getAllEmployees);
router.get('/hierarchy', employeeController.getHierarchy);
router.get('/departments', employeeController.getDepartments);
router.get('/potential-managers', employeeController.getPotentialManagers);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

export default router;