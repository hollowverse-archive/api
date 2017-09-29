import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { IsEmail, IsUrl, ValidateIf } from 'class-validator';
import { Trim } from 'class-sanitizer';
import { BaseEntity } from './base';
import { Event } from './event';
import { Comment } from './comment';

/**
 * A Hollowverse user
 */
@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ValidateIf((_, v) => typeof v === 'string')
  @IsEmail({
    allow_display_name: false,
    require_tld: true,
  })
  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string | null;

  @Trim()
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @ValidateIf((_, v) => typeof v === 'string')
  @IsUrl({
    require_protocol: true,
    require_valid_protocol: true,
    protocols: ['https', 'http'],
  })
  @Column({ type: 'text', nullable: true })
  photoUrl: string | null;

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

  @Column({ type: 'varchar', nullable: false, unique: true })
  fbId: string;
}
