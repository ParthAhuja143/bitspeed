import express from 'express';
import { ContactController } from '../controllers/ContactController';

const router = express.Router();

export const setupContactRoutes = (contactController: ContactController) => {
  router.post('/identify', contactController.identify);
  return router;
};

export default setupContactRoutes;