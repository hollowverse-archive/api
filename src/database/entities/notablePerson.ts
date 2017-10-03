import {
  Entity,
  Column,
  AfterLoad,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Trim } from 'class-sanitizer';
import { IsNotEmpty } from 'class-validator';
import { BaseEntity } from './base';
import { NotablePersonEvent } from './event';
import { NotablePersonLabel } from './label';
import { URL } from 'url';

/**
 * A public figure or an influential person
 */
@Entity()
export class NotablePerson extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Trim()
  @IsNotEmpty()
  @Column({ unique: true, nullable: false })
  slug: string;

  @Trim()
  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: false })
  name: string;

  /** The filename of the photo as stored in S3 */
  @Column({ type: 'varchar', nullable: false, unique: true })
  @IsNotEmpty()
  @Trim()
  photoId: string;

  /** Photo URL computed from `photoId`, not an actual column. */
  photoUrl: string;

  @OneToMany(_ => NotablePersonEvent, event => event.notablePerson, {
    cascadeInsert: true,
    cascadeUpdate: true,
  })
  events: NotablePersonEvent[];

  @ManyToMany(_ => NotablePersonLabel, {
    cascadeInsert: true,
    cascadeUpdate: true,
  })
  @JoinTable()
  labels: NotablePersonLabel[];

  @AfterLoad()
  setPhotoUrl() {
    this.photoUrl = new URL(
      `notable-people/${this.slug}`,
      'https://files.hollowverse.com',
    ).toString();
  }
}
