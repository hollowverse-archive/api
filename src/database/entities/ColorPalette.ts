import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsHexColor, ValidateIf, Validate } from 'class-validator';
import { ToLowerCase } from '@hollowverse/class-sanitizer';
import { BaseEntity } from './BaseEntity';
import { StartsWith } from '../customValidators/startsWith';

/** A color palette of a photo */
@Entity()
export class ColorPalette extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  @ValidateIf((_, v) => typeof v === 'string')
  @IsHexColor()
  @ToLowerCase()
  @Validate(StartsWith, ['#'])
  vibrant: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  @ValidateIf((_, v) => typeof v === 'string')
  @IsHexColor()
  @ToLowerCase()
  @Validate(StartsWith, ['#'])
  darkVibrant: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  @ValidateIf((_, v) => typeof v === 'string')
  @IsHexColor()
  @ToLowerCase()
  @Validate(StartsWith, ['#'])
  lightVibrant: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  @ValidateIf((_, v) => typeof v === 'string')
  @IsHexColor()
  @ToLowerCase()
  @Validate(StartsWith, ['#'])
  muted: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  @ValidateIf((_, v) => typeof v === 'string')
  @IsHexColor()
  @ToLowerCase()
  @Validate(StartsWith, ['#'])
  darkMuted: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  @ValidateIf((_, v) => typeof v === 'string')
  @IsHexColor()
  @ToLowerCase()
  @Validate(StartsWith, ['#'])
  lightMuted: string | null;
}
