import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Trim } from 'class-sanitizer';
import { BaseEntity } from './base';

/**
 * A notable person's label
 * @example Liberal, Democrat
 */
@Entity()
export class NotablePersonLabel extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Trim()
  @Column({ type: 'varchar', unique: true, nullable: false })
  text: string;

  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;
}
