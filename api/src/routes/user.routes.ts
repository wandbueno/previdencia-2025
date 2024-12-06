import { Router } from 'express';
import { CreateUserController } from '../controllers/user/createUserController';
import { ListUsersController } from '../controllers/user/listUsersController';
import { UpdateUserController } from '../controllers/user/updateUserController';
import { DeleteUserController } from '../controllers/user/deleteUserController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { ensureSuperAdmin } from '../middlewares/ensureSuperAdmin';
import { ensureOrganizationAdmin } from '../middlewares/ensureOrganizationAdmin';

const userRoutes = Router();

const createUserController = new CreateUserController();
const listUsersController = new ListUsersController();
const updateUserController = new UpdateUserController();
const deleteUserController = new DeleteUserController();

// Protected routes
userRoutes.use(ensureAuthenticated);

// Super admin routes
// userRoutes.get('/admin', ensureSuperAdmin, listUsersController.handleAdmin);
// userRoutes.post('/admin', ensureSuperAdmin, createUserController.handleAdmin);
// userRoutes.put('/admin/:id', ensureSuperAdmin, updateUserController.handleAdmin);
// userRoutes.delete('/admin/:id', ensureSuperAdmin, deleteUserController.handleAdmin);

// Super admin routes
userRoutes.get('/', ensureSuperAdmin, listUsersController.handleAdmin);
userRoutes.post('/', ensureSuperAdmin, createUserController.handleAdmin);
userRoutes.put('/:id', ensureSuperAdmin, updateUserController.handleAdmin);
userRoutes.delete('/:id', ensureSuperAdmin, deleteUserController.handleAdmin);

// Organization routes
userRoutes.get('/organization/:subdomain', ensureOrganizationAdmin, listUsersController.handle);
userRoutes.post('/organization/:subdomain', ensureOrganizationAdmin, createUserController.handle);
userRoutes.put('/organization/:subdomain/:id', ensureOrganizationAdmin, updateUserController.handle);
userRoutes.delete('/organization/:subdomain/:id', ensureOrganizationAdmin, deleteUserController.handle);

export { userRoutes };