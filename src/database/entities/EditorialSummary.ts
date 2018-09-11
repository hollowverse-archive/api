import { Trim } from '@hollowverse/class-sanitizer';
import { IsNotEmpty, ValidateIf } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { EditorialSummaryNode } from './EditorialSummaryNode';

/**
 * Content from the old Hollowverse website
 */
@Entity()
export class EditorialSummary extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', nullable: true })
  lastUpdatedOn: Date | null;

  /** Author of old Hollowverse content */
  @Trim()
  @IsNotEmpty()
  @ValidateIf((_, v) => typeof v === 'string')
  @Column({ type: 'varchar', nullable: false })
  author: string;

  /**
   * Text nodes, headings, breaks... etc. used to reconstruct the editorial summary
   */

  @OneToMany(_ => EditorialSummaryNode, node => node.editorialSummary, {
    cascadeInsert: true,
    cascadeUpdate: true,
    eager: false,
  })
  nodes: EditorialSummaryNode[];
}
