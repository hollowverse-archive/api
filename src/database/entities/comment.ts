import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Trim } from 'class-sanitizer';
import { BaseEntity } from './base';
import { Event } from './event';
import { User } from './user';

/**
 * A comment on a notable person's event
 */
@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ type: 'text', nullable: false })
  @Trim()
  text: string;

  @Column({ type: 'datetime', nullable: false })
  postedAt: Date;

  @ManyToOne(_ => Event, event => event.owner, {
    nullable: false,
  })
  event: Event;

  @ManyToOne(_ => User, user => user.comments, {
    nullable: false,
    cascadeInsert: true,
    cascadeUpdate: true,
    cascadeRemove: true,
  })
  owner: User;
}
