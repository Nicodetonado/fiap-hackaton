import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { validate } from '../middlewares/validate';
import { adminController, createUserValidations } from '../controllers/adminController';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('sysadmin'));

router.get('/turmas', adminController.listTurmas);
router.post('/users', validate(createUserValidations), adminController.createUser);

export default router;
