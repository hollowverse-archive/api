import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Event } from './event';
import { Comment } from './comment';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  photoUrl: string;

  @OneToMany(_ => Event, event => event.owner, {
    cascadeInsert: true,
    cascadeUpdate: true,
  })
  events: Event[];

  @OneToMany(_ => Comment, comment => comment.owner, {
    cascadeInsert: true,
    cascadeUpdate: true,
  })
  comments: Comment[];

  @Column({ type: 'datetime', nullable: false })
  signedUpAt: Date;
}
