import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from "typeorm"



@Entity()
export class Movie {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    Title: string

    @Column()
    Runtime: string

    @Column()
    Year:string

    @Column()
    Director: string

    @Column()
    Genre: string

    @Column()
    Poster: string

    @Column()
    isDeleted:boolean

    @Column({
        nullable:true
    })
    imdbID:string

}