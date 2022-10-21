import { Router } from 'express';

import authRouter from './auth.router';
import favoriteRouter from './favorite.router';
import movieRouter from './movie.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/movies', movieRouter);
router.use('/', favoriteRouter);

export default router;
