import { BeforeInsert, BeforeUpdate } from 'typeorm';
import { validateOrReject } from 'class-validator';

export class BaseEntity {
  @BeforeInsert()
  validate() {
    return validateOrReject(this);
  }

  @BeforeUpdate()
  validateUpdate() {
    return validateOrReject(this, { skipMissingProperties: true });
  }
}
