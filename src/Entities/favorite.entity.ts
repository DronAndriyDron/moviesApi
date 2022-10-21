import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinTable} from "typeorm"
import {Users} from "./user.entity";
import {Movie} from "./movie.entity";

@Entity()
export class Favorite {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Users)
    @JoinTable()
    user: Users;

    @ManyToOne(() => Movie)
    @JoinTable()
    movie: Movie;

}