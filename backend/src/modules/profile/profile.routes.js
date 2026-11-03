import express from 'express';
import { verificarToken } from '../../middleware/auth.middleware.js';
import { getPerfil, putPerfil, putContrasena, getPreferencias, putPreferencias } from './profile.controller.js';

const router = express.Router();

router.use(verificarToken);

router.get('/', getPerfil);
router.put('/', putPerfil);
router.put('/password', putContrasena);
router.get('/preferences', getPreferencias);
router.put('/preferences', putPreferencias);

export default router;
