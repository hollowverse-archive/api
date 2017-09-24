import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { NotablePerson } from './notablePerson';
import { User } from './user';
import { Comment } from './comment';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ type: 'text', nullable: false })
  quote: string;

  @Column({ nullable: false })
  isQuoteByNotablePerson: boolean;

  @Column({ type: 'text', nullable: false })
  sourceUrl: string;

  @Column({ type: 'datetime', nullable: false })
  postedAt: Date;

  @Column({ type: 'date', nullable: false })
  happenedOn: Date;

  @ManyToOne(_ => NotablePerson, np => np.events, {
    nullable: false,
  })
  notablePerson: NotablePerson;

  @ManyToOne(_ => User, user => user.events, {
    nullable: false,
  })
  owner: User;

  @OneToMany(_ => Comment, comment => comment.event, {
    cascadeInsert: true,
    cascadeUpdate: true,
  })
  comments: Comment[];
}
