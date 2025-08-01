import { Column, CreateDateColumn, Entity , ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "../../users/entities/user.entity";

@Entity("addresses")
export class AddressEntity {

    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({nullable: false , length :100})
    province: string

    @Column({nullable: false , length : 100})
    city: string

    @Column({nullable: false , type : 'text'})
    address: string

    @Column({length: 10 , nullable : false})
    postal_code: string

    @Column({length: 11 , nullable : false})
    receiver_phone: string

    @Column({nullable: true , type : "text"})
    description: string

    @ManyToOne(() => UserEntity, (user) => user.addresses, { onDelete: "CASCADE" })
    user: UserEntity;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

     
}
