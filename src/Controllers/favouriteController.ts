import { Request, Response } from 'express';

import { myDataSource } from '../DBconfig/config';
import { Favorite } from '../Entities/favorite.entity';
import { Movie } from '../Entities/movie.entity';
import { Users } from '../Entities/user.entity';
import { $omdApi } from '../Util/axiosBase';

class FavouriteController {
	async addToFavorite(req: Request, res: Response) {
		const user = await myDataSource
			.getRepository(Users)
			.findOneBy({
				id: +req.user.id
			});

		if (user) {
			const movie = await myDataSource
				.getRepository(Movie)
				.findOneBy({
					imdbID: req.params.imdbID
				});

			if (movie) {
				const favorite = new Favorite(user, movie);
				const saved = await myDataSource
					.getRepository(Favorite)
					.save(favorite);

				res.status(200).json({
					favorite: saved
				});
			} else {
				try {
					const { data } = await $omdApi.get('/', {
						params: {
							i: req.params.imdbID
						}
					});

					const newMovie = new Movie(
						data.Title,
						data.Runtime,
						data.Year,
						data.Director,
						data.Genre,
						data.Poster,
						false,
						true
					);
					const savedMovie = await myDataSource
						.getRepository(Movie)
						.save(newMovie);
					const favorite = new Favorite(user, savedMovie);

					const saved = await myDataSource
						.getRepository(Favorite)
						.save(favorite);
					res.status(200).json({
						favorite: saved
					});
				} catch (e) {
					res.status(400).json({
						message: 'movie not found'
					});
				}
			}
		} else {
			res.status(400).json({
				message: 'user not found'
			});
		}
	}

	async getFavorites(req: Request, res: Response) {
		const user = await myDataSource
			.getRepository(Users)
			.findOneBy({
				id: +req.user.id
			});
		if (user) {
			const result = await myDataSource
				.getRepository(Favorite)
				.find({
					where: {
						user: user
					},
					relations: ['user', 'movie']
				});

			const movies = result.map(el => {
				return el.movie;
			});

			res.status(200).json({
				movies
			});
		} else {
			res.status(400).json({
				message: 'user not found'
			});
		}
	}

	async updateMovieById(req: Request, res: Response) {
		const {
			Title,
			Runtime,
			Year,
			Director,
			Genre,
			Poster
		} = req.body;
		const movie = await myDataSource
			.getRepository(Movie)
			.findOneBy({
				imdbID: req.params.imdbID
			});

		if (movie) {
			const saved = await myDataSource
				.getRepository(Movie)
				.save({
					Title,
					Runtime,
					Year,
					Director,
					Genre,
					Poster
				});

			res.status(200).json({
				movie: saved
			});
		} else {
			try {
				const { data } = await $omdApi.get('/', {
					params: {
						i: req.params.imdbID
					}
				});
				const movieParams = { ...req.body, ...data };
				const newMovie = new Movie(
					movieParams.Title,
					movieParams.Runtime,
					movieParams.Year,
					movieParams.Director,
					movieParams.Genre,
					movieParams.Poster,
					false,
					true
				);
				const savedMovie = await myDataSource
					.getRepository(Movie)
					.save(newMovie);

				res.status(200).json({
					movie: savedMovie
				});
			} catch (e) {
				res.status(400).json({
					message: 'movie not found'
				});
			}
		}
	}
}

export default new FavouriteController();
