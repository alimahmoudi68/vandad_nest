import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('uploads')
export class UploadEntity {

    @PrimaryGeneratedColumn('increment')
    id: number;
    
    @Column({ nullable: false })
    title: string;

    @Column({ nullable: false })
    bucket: string;

    @Column({ nullable: false })
    location: string;

    @Column({ nullable: false })
    alt: string;

    @CreateDateColumn()
    created_at: Date;
}
