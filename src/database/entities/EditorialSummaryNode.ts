import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { IsNotEmpty, ValidateIf, IsUrl, IsIn } from 'class-validator';
import { BaseEntity } from './BaseEntity';
import { EditorialSummary } from './EditorialSummary';
import {
  EditorialSummaryNodeType,
  EditorialSummaryNodeTypeTuple,
} from '../../typings/schema';
import { urlValidationOptions } from '../../helpers/validation';

/**
 * Editorial content from the old Hollowverse website
 */
@Entity()
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

  @IsIn(EditorialSummaryNodeTypeTuple)
  @Column({
    nullable: false,
    type: 'varchar',
  })
  type: EditorialSummaryNodeType;

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
    length: 1000,
  })
  sourceUrl: string | null;

  @Column({
    nullable: true,
    type: 'varchar',
  })
  sourceTitle: string | null;

  @ManyToOne(
    _ => EditorialSummary,
    editorialSUmmary => editorialSUmmary.nodes,
    {
      nullable: false,
    },
  )
  editorialSummary: EditorialSummary;

  @ManyToOne(_ => EditorialSummaryNode, node => node.children)
  parent: EditorialSummaryNode | null;

  @OneToMany(_ => EditorialSummaryNode, node => node.parent)
  children: EditorialSummaryNode[];
}
