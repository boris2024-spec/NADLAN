import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateProfileUpdate, validatePropertyUpdate } from '../middleware/validation.js';
import {
    listUsers,
    updateUser,
    deleteUser,
    listProperties,
    updatePropertyStatus,
    deletePropertyAdmin,
    updatePropertyAdmin,
    exportPropertiesExcel,
    exportUsersExcel
} from '../controllers/adminController.js';

const router = express.Router();

// Protect all admin routes
router.use(authenticateToken, requireRole('admin'));

// Users management
router.get('/users', listUsers);
router.get('/users/export', exportUsersExcel);
router.patch('/users/:id', validateProfileUpdate, updateUser);
router.delete('/users/:id', deleteUser);

// Properties management
router.get('/properties', listProperties);
router.get('/properties/export', exportPropertiesExcel);
router.patch('/properties/:id', validatePropertyUpdate, updatePropertyAdmin);
router.patch('/properties/:id/status', updatePropertyStatus);
router.delete('/properties/:id', deletePropertyAdmin);

export default router;
