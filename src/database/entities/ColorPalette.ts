import { ToLowerCase } from '@hollowverse/class-sanitizer';
import { IsHexColor, Validate, ValidateIf } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { StartsWith } from '../customValidators/startsWith';
import { BaseEntity } from './BaseEntity';

/** A color palette of a photo */
@Entity()
export class ColorPalette extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
