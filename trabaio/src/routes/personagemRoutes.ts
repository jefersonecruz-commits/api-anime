import { Router } from 'express';
import * as controller from '../controllers/personagemController';
import { autenticar } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', controller.listar);
router.get('/:id', controller.obterPorId);

router.post('/', autenticar, controller.criar);
router.put('/:id', autenticar, controller.atualizar);
router.delete('/:id', autenticar, controller.deletar);

export default router;
