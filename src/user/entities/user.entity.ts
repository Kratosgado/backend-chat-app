import { BaseEntity, Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import * as bcrypt from 'bcrypt';
import { Conversation } from "src/conversation/entities/conversation.entity";

@Entity()
@Unique(['username'])
export class User extends BaseEntity{
   @PrimaryGeneratedColumn()
   id: number;

   @Column()
   username: string;

   @Column()
   password: string;

   @Column()
   createdAt: Date;

   @OneToMany(type => User, user => user.friends)
   friends: User[];

   @Column()
   salt: string;

   @ManyToMany(type => Conversation, conversation => conversation.users, {eager: true})
   conversations: Conversation

   // @OneToMany(type => Task, task => task.user, {eager: true})
   // tasks: Task[];

   async validatePassword(password: string): Promise<boolean> {
      const hash = await bcrypt.hash(password, this.salt);
      return hash === this.password;
   }
}