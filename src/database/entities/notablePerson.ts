import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Event } from './event';

@Entity()
export class NotablePerson {
  @PrimaryGeneratedColumn() id: number;

  @Column({ unique: true, nullable: false })
  slug: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @OneToMany(_ => Event, event => event.notablePersonId)
  events: Event[];
}
