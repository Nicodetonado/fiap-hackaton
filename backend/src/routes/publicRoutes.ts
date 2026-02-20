import { Router } from 'express';
import { turmaController, linkTokenParamValidation } from '../controllers/turmaController';
import { validate } from '../middlewares/validate';

const router = Router();

router.get(
  '/turmas/link/:linkToken',
  validate(linkTokenParamValidation),
  turmaController.getPublicByLinkToken
);

export default router;
