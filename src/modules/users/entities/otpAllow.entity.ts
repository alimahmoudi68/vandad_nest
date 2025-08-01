import { Column , Entity , CreateDateColumn , UpdateDateColumn , PrimaryGeneratedColumn } from "typeorm";

@Entity("otpAllow")
export class OtpAllowEntity{

    @PrimaryGeneratedColumn("increment")
    id : number;

    @Column({length : 25}) 
    ip : string;

    @Column({nullable : false , type: 'tinyint'}) 
    count : number;

    @Column({ nullable : false }) 
    date : Date;

    @CreateDateColumn()
    created_at : Date;

    @UpdateDateColumn()
    updated_at : Date;
}