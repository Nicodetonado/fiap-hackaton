import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';
import {
  turmaController,
  createTurmaValidations,
  updateTurmaValidations,
  idParamValidation,
  turmaIdParamValidation,
  createBlocoValidations,
  updateBlocoValidations,
  blocoIdParamValidation,
  createMaterialValidations,
  updateMaterialValidations,
  materialIdParamValidation,
} from '../controllers/turmaController';
import { blocoController } from '../controllers/blocoController';
import { materialController } from '../controllers/materialController';
import { alunoController, addAlunoValidations, removeAlunoValidations } from '../controllers/alunoController';

const router = Router();

router.use(authMiddleware);

router.get('/', turmaController.list);
router.post('/', validate(createTurmaValidations), turmaController.create);
router.get('/:id/alunos', validate(idParamValidation), alunoController.list);
router.post('/:id/alunos', validate(addAlunoValidations), alunoController.add);
router.delete('/:id/alunos/:userId', validate(removeAlunoValidations), alunoController.remove);
router.get('/:id', validate(idParamValidation), turmaController.getById);
router.put('/:id', validate(updateTurmaValidations), turmaController.update);
router.delete('/:id', validate(idParamValidation), turmaController.delete);

router.get(
  '/:turmaId/blocos',
  validate(turmaIdParamValidation),
  blocoController.list
);
router.post(
  '/:turmaId/blocos',
  validate(createBlocoValidations),
  blocoController.create
);

export default router;
