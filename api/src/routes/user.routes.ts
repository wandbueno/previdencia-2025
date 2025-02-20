import { Router } from 'express';
import { CreateUserController } from '../controllers/user/createUserController';
import { ListUsersController } from '../controllers/user/listUsersController';
import { UpdateUserController } from '../controllers/user/updateUserController';
import { DeleteUserController } from '../controllers/user/deleteUserController';
import { GetUserController } from '../controllers/user/getUserController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { ensureSuperAdmin } from '../middlewares/ensureSuperAdmin';
import { ensureOrganizationAdmin } from '../middlewares/ensureOrganizationAdmin';

const userRoutes = Router();

const createUserController = new CreateUserController();
const listUsersController = new ListUsersController();
const updateUserController = new UpdateUserController();
const deleteUserController = new DeleteUserController();
const getUserController = new GetUserController();

// Protected routes
userRoutes.use(ensureAuthenticated);

// Super admin routes
userRoutes.get('/', ensureSuperAdmin, listUsersController.handleAdmin);
userRoutes.post('/', ensureSuperAdmin, createUserController.handleAdmin);
userRoutes.put('/:id', ensureSuperAdmin, updateUserController.handle);
userRoutes.delete('/:id', ensureSuperAdmin, deleteUserController.handle);

// Organization routes
userRoutes.get('/:subdomain/users', ensureOrganizationAdmin, listUsersController.handle);
userRoutes.post('/:subdomain/users', ensureOrganizationAdmin, createUserController.handle);
userRoutes.put('/:subdomain/users/:id', ensureOrganizationAdmin, updateUserController.handle);
userRoutes.delete('/:subdomain/users/:id', ensureOrganizationAdmin, deleteUserController.handle);

// Public route to get user by ID (used by proof of life review)
userRoutes.get('/users/:id', getUserController.handle);

export { userRoutes };