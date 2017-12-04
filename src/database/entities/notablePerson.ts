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
import { NotablePersonLabel } from './notablePersonLabel';
import { EditorialSummaryNode } from './editorialSummaryNode';
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
  @Column({ type: 'text', nullable: true })
  summary: string | null;

  /** Photo URL computed from `photoId`, not an actual column. */
  photoUrl: string;

  /**
   * This is used to load Facebook comments on the client.
   * 
   * This should be treated as an opaque value because the protocol and path parts
   * of this URL might be different depending on whether the notable person
   * was imported from the old Hollowverse website or not. The trailing slash may
   * also be included or removed.
   * 
   * @example: http://hollowverse.com/tom-hanks/ or https://hollowverse.com/Bill_Gates
   */
  commentsUrl: string;

  @OneToMany(_ => NotablePersonEvent, event => event.notablePerson, {
    cascadeInsert: true,
    cascadeUpdate: true,
  })
  events: NotablePersonEvent[];

  @OneToMany(_ => EditorialSummaryNode, node => node.notablePerson, {
    cascadeInsert: true,
    cascadeUpdate: true,
  })
  editorialSummaryNodes: EditorialSummaryNode[];

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

  @AfterLoad()
  setCommentsUrl() {
    let url: URL;

    if (this.oldSlug !== null) {
      url = new URL(
        `${this.oldSlug}/`,
        // tslint:disable-next-line:no-http-string
        'http://hollowverse.com',
      );
    } else {
      url = new URL(`${this.slug}`, 'https://hollowverse.com');
    }

    this.commentsUrl = url.toString();
  }
}
