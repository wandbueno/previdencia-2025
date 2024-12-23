import { Router } from 'express';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { CreateEventController } from '../controllers/event/createEventController';
import { ListEventsController } from '../controllers/event/listEventsController';
import { DeleteEventController } from '../controllers/event/deleteEventController';
import { UpdateEventController } from '../controllers/event/updateEventController';

const eventRoutes = Router();
const createEventController = new CreateEventController();
const listEventsController = new ListEventsController();
const deleteEventController = new DeleteEventController();
const updateEventController = new UpdateEventController();

// Proteger todas as rotas
eventRoutes.use(ensureAuthenticated);

// Rotas de eventos
eventRoutes.post('/', createEventController.handle);
eventRoutes.get('/', listEventsController.handle);
eventRoutes.delete('/:id', deleteEventController.handle);
eventRoutes.put('/:id', updateEventController.handle);

export { eventRoutes };