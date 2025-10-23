import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import multer from 'multer';

const router = Router();
const employeeController = new EmployeeController();
const upload = multer({ dest: 'uploads/' });

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
router.put('/:id/promote', employeeController.promoteEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', requireAdmin, employeeController.deleteEmployee);
router.get('/export', employeeController.exportEmployeesCsv);
router.post('/import', requireAdmin, upload.single('file'), employeeController.importEmployeesCsv);
router.get('/me', async (req, res) => {
  try {
    const employee = await employeeController.getEmployeeForCurrentUser(req, res);
    if (employee !== undefined) return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current user employee record' });
  }
});

export default router;