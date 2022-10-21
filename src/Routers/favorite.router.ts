import { Router } from 'express';

import FavouriteController from '../Controllers/favouriteController';
import movieRouter from './movie.router';

const authMiddleware = require('../MiddleWare/authMiddleware');

const favoriteRouter = Router();

movieRouter.post(
	'/addToFavorite/:imdbID',
	authMiddleware,
	FavouriteController.addToFavorite
);
movieRouter.get(
	'/favorites',
	authMiddleware,
	FavouriteController.getFavorites
);
movieRouter.patch(
	'/updateMovie/:imdbID',
	authMiddleware,
	FavouriteController.updateMovieById
);

export default favoriteRouter;
