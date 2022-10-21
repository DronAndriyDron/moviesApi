import {
	Column,
	Entity,
	PrimaryGeneratedColumn
} from 'typeorm';

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
			const unicId = '' + Date.now();
			this.imdbID = unicId.substring(
				unicId.length - 7,
				unicId.length
			);
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
