import { Router } from 'express';

import MovieController from '../Controllers/movieController';

const authMiddleware = require('../MiddleWare/authMiddleware');

const movieRouter = Router();

movieRouter.post(
	'/',
	authMiddleware,
	MovieController.createMovie
);
movieRouter.get(
	'/',
	authMiddleware,
	MovieController.getMovies
);
movieRouter.get(
	'/:imdbID',
	authMiddleware,
	MovieController.getMovieById
);
movieRouter.delete(
	'/:imdbID',
	authMiddleware,
	MovieController.deleteMovieById
);

export default movieRouter;
