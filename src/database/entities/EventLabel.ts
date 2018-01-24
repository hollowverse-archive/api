import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { Trim } from '@hollowverse/class-sanitizer';
import { BaseEntity } from './BaseEntity';

/**
 * A event's label
 * @example democracy, philosophy
 */
@Entity()
export class EventLabel extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Trim()
  @IsNotEmpty()
  @Column({ type: 'varchar', unique: true, nullable: false })
  text: string;

  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;
}
