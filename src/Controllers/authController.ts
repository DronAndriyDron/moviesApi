import { Request, Response } from 'express';

import { myDataSource } from '../DBconfig/config';
import { Users } from '../Entities/user.entity';
import { generateAccessToken } from '../Util/generateToken';

const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

class AuthController {
	async register(req: Request, res: Response) {
		try {
			const errors = validationResult(req);

			if (!errors.isEmpty()) {
				return res
					.status(400)
					.json({ message: 'registration error', errors });
			}

			const { email, password } = req.body;
			const candidate = await myDataSource
				.getRepository(Users)
				.findOneBy({
					email: email
				});

			if (candidate) {
				return res
					.status(400)
					.json({ message: 'User already exist' });
			}

			const hashPassword = bcrypt.hashSync(password, 7);
			const user = new Users();

			user.email = email;
			user.password = hashPassword;

			await myDataSource.getRepository(Users).save(user);

			return res.json({
				message: 'user successfully sign up'
			});
		} catch (e) {
			console.error(e);
			res
				.status(400)
				.json({ message: 'Registration error' });
		}
	}

	async login(req: Request, res: Response) {
		try {
			const { email, password } = req.body;
			const user = await myDataSource
				.getRepository(Users)
				.findOneBy({
					email: email
				});

			if (!user) {
				return res
					.status(400)
					.json({ message: `User ${email} not exist` });
			}

			const validPassword = bcrypt.compareSync(
				password,
				user.password
			);

			if (!validPassword) {
				return res
					.status(400)
					.json({ message: `Incorrect password entered` });
			}

			const token = generateAccessToken(
				user.id,
				user.email
			);

			return res.json({ token });
		} catch (e) {
			console.error(e);
			res.status(400).json({ message: 'Login error' });
		}
	}
}

export default new AuthController();
