import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { IsEmail, IsNotEmpty, ValidateIf } from 'class-validator';
import { Trim } from '@hollowverse/class-sanitizer';
import { normalizeEmail, isEmail } from 'validator';
import { BaseEntity } from './BaseEntity';
import { NotablePersonEvent } from './NotablePersonEvent';
import { NotablePersonEventComment } from './NotablePersonEventComment';

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
  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  photoId: string | null;

  @OneToMany(_ => NotablePersonEvent, event => event.owner, {
    cascade: ['insert', 'update'],
  })
  events: NotablePersonEvent[];

  @OneToMany(_ => NotablePersonEventComment, comment => comment.owner, {
    cascade: ['insert', 'update'],
  })
  comments: NotablePersonEventComment[];

  @Column({ type: 'datetime', nullable: false })
  signedUpAt: Date;

  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: false, unique: true })
  fbId: string;
  async validate() {
    if (typeof this.email === 'string' && isEmail(this.email)) {
      this.email = normalizeEmail(this.email, { lowercase: true }) || null;
    }

    return super.validate();
  }
}
