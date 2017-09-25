import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { IsEmail, IsUrl } from 'class-validator';
import { BaseEntity } from './base';
import { Event } from './event';
import { Comment } from './comment';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @IsEmail({
    allow_display_name: false,
    require_tld: true,
  })
  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @IsUrl({
    require_protocol: true,
    require_valid_protocol: true,
    protocols: ['https', 'http'],
  })
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
