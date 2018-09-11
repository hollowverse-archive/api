import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { IsNotEmpty, ValidateIf, IsUrl } from 'class-validator';
import { BaseEntity } from './BaseEntity';
import { ColorPalette } from './ColorPalette';
import { urlValidationOptions } from '../../helpers/validation';
import { transformTinyIntOrNull } from '../valueTransfomers/tinyIntOrNull';

/** A photo with metadata, including license and copyright information */
@Entity()
@Index(['sourceUrl', 's3Path'], { unique: true })
export class Photo extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ValidateIf((_, v) => typeof v === 'string')
  @IsNotEmpty()
  @Column({ type: 'varchar', length: 10000, nullable: true })
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

  @Column({
    type: 'tinyint',
    nullable: true,
    transformer: transformTinyIntOrNull,
  })
  isCopyrighted: boolean | null;

  @Column({
    type: 'tinyint',
    nullable: false,
    transformer: transformTinyIntOrNull,
  })
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

  @OneToOne(_ => ColorPalette, {
    nullable: true,
    cascadeAll: true,
    lazy: true,
  })
  @JoinColumn()
  colorPalette: Promise<ColorPalette | null>;
}
