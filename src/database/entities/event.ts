import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { IsUrl } from 'class-validator';
import { Trim } from 'class-sanitizer';
import { BaseEntity } from './base';
import { NotablePerson } from './notablePerson';
import { User } from './user';
import { Comment } from './comment';

/**
 * An event about a notable person
 */
@Entity()
export class Event extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Trim()
  @Column({ type: 'text', nullable: false })
  quote: string;

  @Column({ nullable: false })
  isQuoteByNotablePerson: boolean;

  @IsUrl({
    require_protocol: true,
    require_valid_protocol: true,
    protocols: ['https', 'http'],
  })
  @Trim()
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
