import { Column , Entity , CreateDateColumn , UpdateDateColumn , PrimaryGeneratedColumn } from "typeorm";


@Entity("otp")
export class OtpEntity{

    @PrimaryGeneratedColumn("increment")
    id : number;

    @Column({unique : true , nullable : false , length : 12}) 
    phone : string;

    @Column({nullable : false , length : 50})
    token : string;

    @Column({nullable : false , length : 100})
    otp : string;

    @Column({nullable : false}) 
    date : Date;

    @CreateDateColumn()
    created_at : Date;

    @UpdateDateColumn()
    updated_at : Date;
}