import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { IsUrl } from 'class-validator';
import { BaseEntity } from './base';
import { Event } from './event';
import { Label } from './label';

@Entity()
export class NotablePerson extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ unique: true, nullable: false })
  slug: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @IsUrl({
    require_protocol: true,
    require_valid_protocol: true,
    protocols: ['https'],
  })
  @Column({ type: 'text', nullable: false })
  photoUrl: string;

  @OneToMany(_ => Event, event => event.notablePerson, {
    cascadeInsert: true,
    cascadeUpdate: true,
  })
  events: Event[];

  @ManyToMany(_ => Label, label => label.notablePerson, {
    cascadeInsert: true,
    cascadeUpdate: true,
  })
  @JoinTable()
  labels: Label[];
}
