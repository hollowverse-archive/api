import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { NotablePerson } from './notablePerson';

@Entity()
export class Label {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  text: string;

  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;

  @ManyToMany(_ => NotablePerson, np => np.labels, {
    cascadeInsert: true,
    cascadeUpdate: true,
  })
  notablePerson: NotablePerson;
}
