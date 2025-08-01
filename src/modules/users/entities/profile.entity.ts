import { Column, Entity , OneToOne, PrimaryGeneratedColumn, JoinColumn} from "typeorm";
import { UserEntity } from "./user.entity";


@Entity("profiles")
export class ProfileEntity{
    
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column({nullable: true , length : 20})
    instagram: string

    @OneToOne(()=>UserEntity , (user)=>user.profile , {onDelete : "CASCADE" , onUpdate : "CASCADE"})
    @JoinColumn({
        name: "userId"
    })
    user: UserEntity;

}