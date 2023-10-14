import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "./message.entity";

@Entity()
export class Conversation { 
   @PrimaryColumn()
   id: string;

   @Column()
   convoName: string;

   @ManyToMany(type => User, user => user.conversations, {eager: true})
   @JoinTable()
   users: User[];

   @OneToMany(type => Message, message => message.conversation, {eager: true})
   messages: Message[];
}
