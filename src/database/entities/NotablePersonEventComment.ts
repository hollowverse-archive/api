import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { Trim } from '@hollowverse/class-sanitizer';
import { BaseEntity } from './BaseEntity';
import { NotablePersonEvent } from './NotablePersonEvent';
import { User } from './User';

/**
 * A comment on a notable person's event
 */
@Entity()
export class NotablePersonEventComment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ type: 'text', nullable: false })
  @Trim()
  @IsNotEmpty()
  text: string;

  @Column({ type: 'datetime', nullable: false })
  postedAt: Date;

  @ManyToOne(_ => NotablePersonEvent, event => event.comments, {
    nullable: false,
  })
  event: NotablePersonEvent;

  @ManyToOne(_ => User, user => user.comments, {
    nullable: false,
  })
  owner: User;
}
