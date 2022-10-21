import {
	Entity,
	JoinTable,
	ManyToOne,
	PrimaryGeneratedColumn
} from 'typeorm';

import { Movie } from './movie.entity';
import { Users } from './user.entity';

@Entity()
export class Favorite {
	constructor(user: Users, movie: Movie) {
		this.user = user;
		this.movie = movie;
	}

	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Users)
	@JoinTable()
	user: Users;

	@ManyToOne(() => Movie)
	@JoinTable()
	movie: Movie;
}
