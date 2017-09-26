import { BeforeInsert, BeforeUpdate } from 'typeorm';
import { validateOrReject } from 'class-validator';

/**
 * Base entity for the database layer.
 * 
 * All entities should extend this class to automatically
 * perform validations on insertions and updates.
 */
export class BaseEntity {
  @BeforeInsert()
  async validate() {
    return validateOrReject(this);
  }

  @BeforeUpdate()
  async validateUpdate() {
    return validateOrReject(this, { skipMissingProperties: true });
  }
}
