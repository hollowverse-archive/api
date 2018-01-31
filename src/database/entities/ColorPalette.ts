import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsHexColor, ValidateIf } from 'class-validator';
import { BaseEntity } from './BaseEntity';

/** A color palette of a photo */
@Entity()
export class ColorPalette extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ type: 'varchar', nullable: true })
  @ValidateIf((_, v) => typeof v === 'string')
  @IsHexColor()
  vibrant: string | null;

  @Column({ type: 'varchar', nullable: true })
  @ValidateIf((_, v) => typeof v === 'string')
  @IsHexColor()
  darkVibrant: string | null;

  @Column({ type: 'varchar', nullable: true })
  @ValidateIf((_, v) => typeof v === 'string')
  @IsHexColor()
  lightVibrant: string | null;

  @Column({ type: 'varchar', nullable: true })
  @ValidateIf((_, v) => typeof v === 'string')
  @IsHexColor()
  muted: string | null;

  @Column({ type: 'varchar', nullable: true })
  @ValidateIf((_, v) => typeof v === 'string')
  @IsHexColor()
  darkMuted: string | null;

  @Column({ type: 'varchar', nullable: true })
  @ValidateIf((_, v) => typeof v === 'string')
  @IsHexColor()
  lightMuted: string | null;
}
