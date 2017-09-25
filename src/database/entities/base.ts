import { BeforeInsert, BeforeUpdate } from 'typeorm';
import { validateOrReject, ValidationError } from 'class-validator';

export class BaseEntity {
  @BeforeInsert()
  validate() {
    return validateOrReject(this).catch((errors: ValidationError[]) => {
      errors.forEach(e => console.log(Object.values(e.constraints)));
      throw errors;
    });
  }

  @BeforeUpdate()
  validateUpdate() {
    return validateOrReject(this, { skipMissingProperties: true });
  }
}
