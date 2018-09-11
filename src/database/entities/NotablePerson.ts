import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
  OneToOne,
  ManyToMany,
  JoinTable,
  AfterLoad,
} from 'typeorm';
import { Trim } from '@hollowverse/class-sanitizer';
import { IsNotEmpty, ValidateIf } from 'class-validator';
import { BaseEntity } from './BaseEntity';
import { NotablePersonEvent } from './NotablePersonEvent';
import { NotablePersonLabel } from './NotablePersonLabel';
import { EditorialSummary } from './EditorialSummary';
import { Photo } from './Photo';
import { URL } from 'url';

/**
 * A public figure or an influential person
 */
@Entity()
export class NotablePerson extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Trim()
  @IsNotEmpty()
  @Column({ type: 'varchar', unique: true, nullable: false })
  slug: string;

  /**
   * The path part of the URL for that notable person on the old Hollowverse
   * website, without the leading slash.
   * `null` if this notable person was not imported from the old website.
   * @example: For http://hollowverse.com/tom-hanks, this would be `tom-hanks`.
   */
  @Column({ type: 'varchar', unique: true, nullable: true })
  oldSlug: string | null;

  @Trim()
  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Trim()
  @Column({ type: 'varchar', length: 5000, nullable: true })
  summary: string | null;

  /**
   * The filename of the photo as stored in S3
   * @deprecated `NotablePerson` can now have multiple photos. Use `mainPhoto` instead.
   */
  @Column({ type: 'varchar', nullable: true, unique: true })
  @ValidateIf((_, v) => typeof v === 'string')
  @IsNotEmpty()
  @Trim()
  photoId: string | null;

  @OneToOne(_ => Photo, {
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  mainPhoto: Photo | null;

  @ManyToMany(_ => Photo)
  @JoinTable()
  photos: Photo[];

  @OneToMany(_ => NotablePersonEvent, event => event.notablePerson, {
    cascadeInsert: true,
    cascadeUpdate: true,
  })
  events: NotablePersonEvent[];

  /**
   * Nodes used to reconstruct the editorial summary,
   * which is the content from the old Hollowverse
   */
  @OneToOne(_ => EditorialSummary, {
    cascadeInsert: true,
    nullable: true,
    lazy: true,
  })
  @JoinColumn()
  editorialSummary: Promise<EditorialSummary | null>;

  @ManyToMany(_ => NotablePersonLabel, {
    lazy: true,
  })
  @JoinTable()
  labels: Promise<NotablePersonLabel[]>;

  @ManyToMany(_ => NotablePerson, { lazy: true })
  @JoinTable()
  relatedPeople: Promise<NotablePerson[]>;

  @Column({ type: 'date', nullable: true, default: null })
  addedOn: Date | null;

  /** Photo URL computed from `photoId`, not an actual column. */

  photoUrl: string | null = null;

  /**
   * This is used to load Facebook comments on the client.
   *
   * This should be treated as an opaque value because the protocol and path parts
   * of this URL might be different depending on whether the notable person
   * was imported from the old Hollowverse website or not. The trailing slash may
   * also be included or removed.
   * @example: http://hollowverse.com/tom-hanks/ or https://hollowverse.com/Bill_Gates
   */

  commentsUrl: string;

  @AfterLoad()
  setCommentsUrl() {
    if (this.oldSlug !== null) {
      this.commentsUrl = new URL(
        `${this.oldSlug}/`,
        // tslint:disable-next-line:no-http-string
        'http://hollowverse.com',
      ).toString();
    }

    this.commentsUrl = new URL(
      `${this.slug}`,
      'https://hollowverse.com',
    ).toString();
  }

  @AfterLoad()
  setPhotoUrl() {
    if (this.photoId !== null) {
      this.photoUrl = new URL(
        `notable-people/${this.photoId}`,
        'https://photos.hollowverse.com',
      ).toString();
    }
  }
}
