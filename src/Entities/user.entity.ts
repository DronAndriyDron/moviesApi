import { Entity, Column, PrimaryGeneratedColumn ,OneToMany} from "typeorm"




@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    email: string

    @Column()
    password: string

    @Column({
        nullable:true
    })
    refreshToken:string

}
