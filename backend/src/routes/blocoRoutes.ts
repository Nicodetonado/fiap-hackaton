import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';
import {
  updateBlocoValidations,
  idParamValidation,
  blocoIdParamValidation,
  createMaterialValidations,
  updateMaterialValidations,
  materialIdParamValidation,
} from '../controllers/turmaController';
import { blocoController } from '../controllers/blocoController';
import { materialController } from '../controllers/materialController';

const router = Router();

router.use(authMiddleware);

router.put('/:id', validate(updateBlocoValidations), blocoController.update);
router.delete('/:id', validate(idParamValidation), blocoController.delete);

router.get(
  '/:blocoId/materiais',
  validate(blocoIdParamValidation),
  materialController.list
);
router.post(
  '/:blocoId/materiais',
  validate(createMaterialValidations),
  materialController.create
);
router.put(
  '/:blocoId/materiais/:id',
  validate([...blocoIdParamValidation, ...updateMaterialValidations]),
  materialController.update
);
router.delete(
  '/:blocoId/materiais/:id',
  validate([...blocoIdParamValidation, ...materialIdParamValidation]),
  materialController.delete
);

export default router;
