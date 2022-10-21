import { Request, Response } from 'express';
import { ILike } from 'typeorm';

import { myDataSource } from '../DBconfig/config';
import { Favorite } from '../Entities/favorite.entity';
import { Movie } from '../Entities/movie.entity';
import { $omdApi } from '../Util/axiosBase';

class MovieController {
	async createMovie(req: Request, res: Response) {
		const {
			Title,
			Runtime,
			Year,
			Director,
			Genre,
			Poster
		} = req.body;

		const movie = new Movie(
			Title,
			Runtime,
			Year,
			Director,
			Genre,
			Poster,
			false,
			true
		);
		const saved = await myDataSource
			.getRepository(Movie)
			.save(movie);

		res.status(200).json({
			imdbID: saved.imdbID
		});
	}

	async getMovies(req: Request, res: Response) {
		const movies = await myDataSource
			.getRepository(Movie)
			.find({
				where: {
					Title: ILike(`%${req.query.search}%`)
				}
			});
		if (movies.length > 0) {
			res.status(200).json({
				movies: movies
			});
		} else {
			try {
				const { data } = await $omdApi.get('/', {
					params: {
						s: req.query.search
					}
				});

				res.status(200).json({
					movies: data.Search
				});
			} catch (e) {
				res.status(500).json({
					error: e
				});
			}
		}
	}

	async getMovieById(req: Request, res: Response) {
		const movie = await myDataSource
			.getRepository(Movie)
			.findOneBy({
				imdbID: req.params.imdbID,
				isDeleted: false
			});

		if (movie) {
			res.status(200).json({
				movie
			});
		} else {
			const { data } = await $omdApi.get('/', {
				params: {
					i: req.params.imdbID
				}
			});
			if (data) {
				res.status(200).json({
					movie: data
				});
			} else {
				res.status(400).json({
					message: 'NOT FOUND'
				});
			}
		}
	}

	async deleteMovieById(req: Request, res: Response) {
		const movie = await myDataSource
			.getRepository(Movie)
			.findOneBy({
				imdbID: req.params.imdbID
			});

		if (movie) {
			const favorites = await myDataSource
				.getRepository(Favorite)
				.find({
					where: {
						movie: movie
					}
				});

			if (favorites.length > 0) {
				const favoritesIds = favorites.map(el => {
					return el.id;
				});

				await myDataSource
					.getRepository(Favorite)
					.delete(favoritesIds);
			}
			await myDataSource.getRepository(Movie).delete(movie);
		}

		res.status(200).json({
			message: 'deleted'
		});
	}
}

export default new MovieController();
