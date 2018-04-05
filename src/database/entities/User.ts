import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { IsEmail, IsNotEmpty, ValidateIf } from 'class-validator';
import { Trim } from '@hollowverse/class-sanitizer';
import { normalizeEmail, isEmail } from 'validator';
import { BaseEntity } from './BaseEntity';
import { NotablePersonEvent } from './NotablePersonEvent';
import { NotablePersonEventComment } from './NotablePersonEventComment';
import { UserRole } from '../../typings/schema';

const userRoles: Record<UserRole, string> = {
  EDITOR: '',
};

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
    cascadeInsert: true,
    cascadeUpdate: true,
  })
  events: NotablePersonEvent[];

  @OneToMany(_ => NotablePersonEventComment, comment => comment.owner, {
    cascadeInsert: true,
    cascadeUpdate: true,
  })
  comments: NotablePersonEventComment[];

  @Column({
    nullable: true,
    type: 'enum',
    default: null,
    enum: Object.keys(userRoles),
  })
  role: UserRole;

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
