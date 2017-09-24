import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { NotablePerson } from './notablePerson';

@Entity()
export class Event {
  @PrimaryGeneratedColumn() id: number;

  @Column({ nullable: false })
  text: string;

  @Column({ nullable: false })
  isQuoteByNotablePerson: boolean;

  @Column({ nullable: false })
  sourceUrl: string;

  @Column({ type: 'datetime', nullable: false })
  addedAt: Date;

  @Column({ type: 'date', nullable: false })
  happenedOn: Date;

  @ManyToOne(_ => NotablePerson, np => np.events)
  notablePersonId: NotablePerson;
}
