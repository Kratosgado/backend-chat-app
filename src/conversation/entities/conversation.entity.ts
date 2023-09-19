import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "./message.entity";

@Entity()
export class Conversation { 
   @PrimaryGeneratedColumn()
   id: string;

   @Column()
   convoName: string;

   @ManyToMany(type => User, user => user.conversations, {eager: false})
   users: User[];

   @OneToMany(type => Message, message => message.conversation, {eager: true})
   messages: Message[];
}
