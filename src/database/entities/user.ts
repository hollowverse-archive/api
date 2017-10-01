import {
  Entity,
  Column,
  AfterLoad,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { IsEmail, IsNotEmpty, ValidateIf } from 'class-validator';
import { Trim } from 'class-sanitizer';
import { BaseEntity } from './base';
import { NotablePersonEvent } from './event';
import { NotablePersonEventComment } from './comment';

import { URL } from 'url';

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

  @Column({ type: 'text', nullable: true })
  photoId: string | null;

  /** Photo URL computed from `photoId`, not an actual column. */
  photoUrl: string;

  @OneToMany(_ => NotablePersonEvent, event => event.owner, {
    cascadeInsert: true,
    cascadeUpdate: true,
  })
  events: NotablePersonEvent[];

  @OneToMany(_ => NotablePersonEventComment, comment => comment.owner, {
    cascadeInsert: true,
    cascadeUpdate: true,
  })
  comments: NotablePersonEventComment[];

  @Column({ type: 'datetime', nullable: false })
  signedUpAt: Date;

  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: false, unique: true })
  fbId: string;

  @AfterLoad()
  setPhotoUrl() {
    this.photoUrl = new URL(
      `users/${this.id}`,
      'https://files.hollowverse.com',
    ).toString();
  }
}
