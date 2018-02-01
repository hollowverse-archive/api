import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { IsNotEmpty, ValidateIf } from 'class-validator';
import { Trim } from '@hollowverse/class-sanitizer';
import { BaseEntity } from './BaseEntity';
import { EditorialSummaryNode } from './EditorialSummaryNode';

/**
 * Content from the old Hollowverse website
 */
@Entity()
export class EditorialSummary extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

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
    cascade: ['insert', 'update'],
    eager: false,
  })
  nodes: EditorialSummaryNode[];
}
