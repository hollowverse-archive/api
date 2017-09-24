import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Event } from './event';

@Entity()
export class NotablePerson {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ unique: true, nullable: false })
  slug: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @OneToMany(_ => Event, event => event.notablePerson, {
    cascadeInsert: true,
    cascadeUpdate: true,
  })
  events: Event[];
}
