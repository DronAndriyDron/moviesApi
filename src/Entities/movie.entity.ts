import {
	Column,
	Entity,
	PrimaryGeneratedColumn
} from 'typeorm';
import {generateId} from '../Util/generateId'

@Entity()
export class Movie {
	constructor(
		Title: string,
		Runtime: string,
		Year: string,
		Director: string,
		Genre: string,
		Poster: string,
		isDeleted = false,
		withImdbId = false
	) {
		this.Title = Title;
		this.Runtime = Runtime;
		this.Year = Year;
		this.Director = Director;
		this.Genre = Genre;
		this.Poster = Poster;
		this.isDeleted = isDeleted;

		if (withImdbId) {
			
			this.imdbID = generateId();
		}
	}

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	Title: string;

	@Column()
	Runtime: string;

	@Column()
	Year: string;

	@Column()
	Director: string;

	@Column()
	Genre: string;

	@Column()
	Poster: string;

	@Column()
	isDeleted: boolean;

	@Column({
		nullable: true
	})
	imdbID: string;
}
