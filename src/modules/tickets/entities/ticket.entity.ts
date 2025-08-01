import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { UserEntity } from "src/modules/users/entities/user.entity";

@Entity("tickets")
export class TicketEntity {

    @PrimaryGeneratedColumn("increment")
    id: number

    @Column({nullable : false , length : 100})
    title: string

    @Column({ nullable: false, type: 'text' })
    description: string

    @ManyToOne(()=>UserEntity , (user)=>user.tickets , {onDelete : "CASCADE"})
    user: UserEntity

    @ManyToOne(()=>TicketEntity , (ticket)=>ticket.childs , {nullable : true})
    parent: TicketEntity

    @OneToMany(()=>TicketEntity , (ticket)=>ticket.parent)
    childs: TicketEntity[]

}
