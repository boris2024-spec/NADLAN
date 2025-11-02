import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
    listUsers,
    updateUser,
    listProperties,
    updatePropertyStatus,
    deletePropertyAdmin
} from '../controllers/adminController.js';

const router = express.Router();

// Protect all admin routes
router.use(authenticateToken, requireRole('admin'));

// Users management
router.get('/users', listUsers);
router.patch('/users/:id', updateUser);

// Properties management
router.get('/properties', listProperties);
router.patch('/properties/:id/status', updatePropertyStatus);
router.delete('/properties/:id', deletePropertyAdmin);

export default router;
