import { Trim } from '@hollowverse/class-sanitizer';
import { IsIn, IsNotEmpty, IsUrl, ValidateIf } from 'class-validator';
import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { urlValidationOptions } from '../../helpers/validation';
import {
  NotablePersonEventReviewStatus,
  NotablePersonEventReviewStatusEnum,
  NotablePersonEventReviewStatusTuple,
  NotablePersonEventType,
  NotablePersonEventTypeTuple,
} from '../../typings/schema';
import { transformTinyIntOrNull } from '../valueTransfomers/tinyIntOrNull';
import { BaseEntity } from './BaseEntity';
import { EventLabel } from './EventLabel';
import { NotablePerson } from './NotablePerson';
import { NotablePersonEventComment } from './NotablePersonEventComment';
import { User } from './User';

/**
 * An event about a notable person
 */
@Entity()
export class NotablePersonEvent extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ValidateIf((_, v) => typeof v === 'string')
  @IsNotEmpty()
  @Column({ type: 'varchar', length: 1000, nullable: true, unique: true })
  quote: string | null;

  @Column({
    type: 'tinyint',
    nullable: true,
    transformer: transformTinyIntOrNull,
  })
  isQuoteByNotablePerson: boolean | null;

  @IsIn(NotablePersonEventTypeTuple)
  @Column({
    nullable: false,
    type: 'varchar',
  })
  @Index()
  type: NotablePersonEventType;

  @ValidateIf((_, v) => {
    return v !== undefined;
  })
  @IsIn(NotablePersonEventReviewStatusTuple)
  @Column({
    nullable: false,
    default: NotablePersonEventReviewStatusEnum.NOT_REVIEWED,
    type: 'varchar',
  })
  @Index()
  reviewStatus: NotablePersonEventReviewStatus;

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
  submittedBy: User;

  /**
   * @deprecated
   */
  @OneToMany(_ => NotablePersonEventComment, comment => comment.event, {
    cascadeInsert: true,
    cascadeUpdate: true,
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

    if (this.type === 'QUOTE') {
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
