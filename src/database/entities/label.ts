import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { BaseEntity } from './base';
import { NotablePerson } from './notablePerson';

/**
 * A notable person's label
 * @example Liberal, Democrat
 */
@Entity()
export class Label extends BaseEntity {
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
