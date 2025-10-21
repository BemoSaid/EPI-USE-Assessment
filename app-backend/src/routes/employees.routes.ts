import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();
const employeeController = new EmployeeController();

// All routes require authentication
router.use(authenticateToken);

router.get('/', employeeController.getAllEmployees);
router.get('/dashboard-stats', employeeController.getDashboardStats);
router.get('/available-for-users', employeeController.getAvailableEmployees);
router.get('/available-roles', employeeController.getAvailableRoles);
router.get('/hierarchy', employeeController.getHierarchy);
router.get('/departments', employeeController.getDepartments);
router.get('/potential-managers', employeeController.getPotentialManagers);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', requireAdmin, employeeController.createEmployee);
router.put('/:id', requireAdmin, employeeController.updateEmployee);
router.delete('/:id', requireAdmin, employeeController.deleteEmployee);

export default router;