import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { IsEmail, IsNotEmpty, ValidateIf, IsIn } from 'class-validator';
import { Trim } from '@hollowverse/class-sanitizer';
import { normalizeEmail, isEmail } from 'validator';
import { BaseEntity } from './BaseEntity';
import { NotablePersonEvent } from './NotablePersonEvent';
import { NotablePersonEventComment } from './NotablePersonEventComment';
import { UserRole, UserRoleTuple } from '../../typings/schema';

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

  @OneToMany(_ => NotablePersonEvent, event => event.submittedBy, {
    cascadeInsert: true,
    cascadeUpdate: true,
  })
  events: NotablePersonEvent[];

  @OneToMany(_ => NotablePersonEventComment, comment => comment.owner, {
    cascadeInsert: true,
    cascadeUpdate: true,
  })
  comments: NotablePersonEventComment[];

  @ValidateIf((_, v) => {
    return v !== undefined && v !== null;
  })
  @IsIn(UserRoleTuple)
  @Column({
    nullable: true,
    default: null,
    type: 'varchar',
  })
  role: UserRole | null;

  @Column({ type: 'datetime', nullable: false })
  signedUpAt: Date;

  @Index()
  @Column({ type: 'tinyint', nullable: false, default: false })
  isBanned: boolean;

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
