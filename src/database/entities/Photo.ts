import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { IsNotEmpty, ValidateIf, IsUrl } from 'class-validator';
import { BaseEntity } from './BaseEntity';
import { urlValidationOptions } from '../../helpers/validation';

/** A photo with metadata, including license and copyright information */
@Entity()
@Index(['sourceUrl', 's3Path'], { unique: true })
export class Photo extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ValidateIf((_, v) => typeof v === 'string')
  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ type: 'datetime', nullable: false })
  addedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  takenAt: Date | null;

  @ValidateIf((_, v) => typeof v === 'string')
  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: true })
  licence: string | null;

  @ValidateIf((_, v) => typeof v === 'string')
  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: true })
  credits: string | null;

  @Column({ type: 'tinyint', nullable: true })
  isCopyrighted: boolean | null;

  @Column({ type: 'tinyint', nullable: false })
  isAttributionRequired: boolean;

  @IsUrl(urlValidationOptions)
  @Column({ type: 'varchar', nullable: false })
  sourceUrl: string;

  @ValidateIf((_, v) => typeof v === 'string')
  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: true })
  artist: string | null;

  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: false })
  s3Path: string;
}
