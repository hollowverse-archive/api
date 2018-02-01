import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { IsUrl, IsNotEmpty, ValidateIf } from 'class-validator';
import { Trim } from '@hollowverse/class-sanitizer';
import { BaseEntity } from './BaseEntity';
import { NotablePerson } from './NotablePerson';
import { User } from './User';
import { NotablePersonEventComment } from './NotablePersonEventComment';
import { EventLabel } from './EventLabel';
import { NotablePersonEventType } from '../../typings/schema';
import { urlValidationOptions } from '../../helpers/validation';

const eventTypes: Record<NotablePersonEventType, string> = {
  quote: '',
  donation: '',
  appearance: '',
};

export type EventType = keyof typeof eventTypes;

/**
 * An event about a notable person
 */
@Entity()
export class NotablePersonEvent extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ValidateIf((_, v) => typeof v === 'string')
  @IsNotEmpty()
  @Column({ type: 'text', nullable: true })
  quote: string | null;

  @Column({ nullable: true, type: 'tinyint' })
  isQuoteByNotablePerson: boolean | null;

  @Column({
    nullable: false,
    type: 'enum',
    default: null,
    enum: Object.keys(eventTypes),
  })
  type: EventType;

  @IsUrl(urlValidationOptions)
  @Trim()
  @Column('varchar', {
    nullable: false,
    length: 600,
  })
  sourceUrl: string;

  /** the official website of the organization, campaign, political event... etc., if any */
  @ValidateIf((_, v) => typeof v === 'string')
  @IsUrl(urlValidationOptions)
  @Column({ type: 'text', nullable: true })
  organizationWebsiteUrl: string | null;

  /** an organization, a campaign, a political event... etc. */
  @Column({ type: 'text', nullable: true })
  organizationName: string | null;

  @Column({ type: 'datetime', nullable: false })
  postedAt: Date;

  @Column({ type: 'date', nullable: true })
  happenedOn: Date | null;

  @ManyToOne(_ => NotablePerson, notablePerson => notablePerson.events, {
    nullable: false,
  })
  notablePerson: NotablePerson;

  @ManyToOne(_ => User, user => user.events, {
    nullable: false,
  })
  owner: User;

  /**
   * @deprecated
   */
  @OneToMany(_ => NotablePersonEventComment, comment => comment.event, {
    cascade: ['insert', 'update'],
  })
  comments: NotablePersonEventComment[];

  @ManyToMany(_ => EventLabel)
  @JoinTable()
  labels: EventLabel[];

  async validate() {
    if (typeof this.organizationWebsiteUrl === 'string') {
      if (typeof this.organizationName !== 'string') {
        throw new TypeError(
          '`organizationName` must be a string if `organizationWebsiteUrl` is specified',
        );
      } else {
        this.organizationName = this.organizationName.trim();
      }
    }

    if (this.type === 'quote') {
      if (!this.quote) {
        if (typeof this.isQuoteByNotablePerson === 'boolean') {
          throw new TypeError(
            '`isQuoteByNotablePerson` should not be defined if `quote` is not specified',
          );
        }

        throw new TypeError(
          'Events of type `quote` must have a valid `quote` field',
        );
      } else {
        this.quote = this.quote.trim();
      }
    }

    return super.validate();
  }
}
