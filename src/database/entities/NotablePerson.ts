import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
  OneToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Trim } from 'class-sanitizer';
import { IsNotEmpty, ValidateIf } from 'class-validator';
import { BaseEntity } from './BaseEntity';
import { NotablePersonEvent } from './NotablePersonEvent';
import { NotablePersonLabel } from './NotablePersonLabel';
import { EditorialSummary } from './EditorialSummary';

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

  /** The filename of the photo as stored in S3 */
  @Column({ type: 'varchar', nullable: true, unique: true })
  @ValidateIf((_, v) => typeof v === 'string')
  @IsNotEmpty()
  @Trim()
  photoId: string | null;

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
    cascadeUpdate: true,
    eager: true,
    nullable: true,
  })
  @JoinColumn()
  editorialSummary: EditorialSummary;

  @ManyToMany(_ => NotablePersonLabel)
  @JoinTable()
  labels: NotablePersonLabel[];
}
