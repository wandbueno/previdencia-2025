import { Router } from 'express';
import { CreateEventController } from '../controllers/event/createEventController';
import { ListEventsController } from '../controllers/event/listEventsController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const eventRoutes = Router();

const createEventController = new CreateEventController();
const listEventsController = new ListEventsController();

eventRoutes.use(ensureAuthenticated);

// Routes for both admin and regular users
eventRoutes.get('/', listEventsController.handle);
eventRoutes.post('/', createEventController.handle);

export { eventRoutes };