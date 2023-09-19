import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Conversation } from "./conversation.entity";

@Entity()
export class Message {
   @PrimaryGeneratedColumn()
   id: string;

   @ManyToOne(type => Conversation, conversation => conversation.messages, { eager : false})
   conversation: Conversation;

   @Column()
   text: string;

   @Column()
   imageUrl?: string;

   @Column()
   onlyEmoji?: boolean;

   @Column()
   senderId: string;

   @Column()
   status: MessageStatus;
}

export enum MessageStatus {
   SENDING = "SENDING",
   SENT = "SENT",
   RECIEVED = "RECIEVED",
   VIEWED = "VIEWED"
}