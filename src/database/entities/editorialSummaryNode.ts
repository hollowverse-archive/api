import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { IsNotEmpty, ValidateIf, IsUrl } from 'class-validator';
import { BaseEntity } from './base';
import { NotablePerson } from './notablePerson';
import { EditorialSummaryNodeType } from '../../typings/schema';
import { urlValidationOptions } from '../../helpers/validation';

const nodeTypes: Record<EditorialSummaryNodeType, string> = {
  break: '',
  sentence: '',
  quote: '',
  heading: '',
};

export type NodeType = keyof typeof nodeTypes;

/**
 * Editorial content from the old Hollowverse website
 */
@Entity()
@Index(['order', 'notablePerson'], { unique: true })
export class EditorialSummaryNode extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  /**
   * The order of the editorial summary node in the
   * original text, used to reconstruct the text
   */
  @Column({
    nullable: false,
    type: 'smallint',
  })
  order: number;

  @Column({
    nullable: false,
    type: 'enum',
    default: null,
    enum: Object.keys(nodeTypes),
  })
  type: NodeType;

  @Column('varchar', {
    nullable: true,
    length: 1000,
  })
  @ValidateIf((_, v) => typeof v === 'string')
  @IsNotEmpty()
  text: string | null;

  @ValidateIf((_, v) => typeof v === 'string')
  @IsUrl(urlValidationOptions)
  @Column('varchar', {
    nullable: true,
    length: 600,
  })
  sourceUrl: string | null;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  sourceTitle: string | null;

  @ManyToOne(
    _ => NotablePerson,
    notablePerson => notablePerson.editorialSummaryNodes,
    {
      nullable: false,
    },
  )
  notablePerson: NotablePerson;
}
