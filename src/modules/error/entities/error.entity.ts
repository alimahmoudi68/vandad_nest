import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity("errors")
export class ErrorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable : false , length : 200})
  url: string;

  @Column({nullable : false , length : 10})
  method: string;

  @Column({nullable : false , length : 25})
  ip: string;

  @Column('text')
  message: string;

  @Column({nullable : false})
  statusCode: number;

  @CreateDateColumn()
  timestamp: Date;
}
