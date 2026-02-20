import { Router } from 'express';
import { authController, registerValidations, loginValidations, changePasswordValidations } from '../controllers/authController';
import { validate } from '../middlewares/validate';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', validate(registerValidations), authController.register);
router.post('/login', validate(loginValidations), authController.login);
router.post('/change-password', authMiddleware, validate(changePasswordValidations), authController.changePassword);

export default router;
