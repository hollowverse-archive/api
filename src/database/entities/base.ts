import { BeforeInsert, BeforeUpdate } from 'typeorm';
import { validateOrReject } from 'class-validator';
import { sanitizeAsync } from 'class-sanitizer';

/**
 * Base entity for the database layer.
 * 
 * All entities should extend this class to automatically
 * perform validations on insertions and updates.
 */
export class BaseEntity {
  @BeforeInsert()
  async validate() {
    await validateOrReject(this);

    return sanitizeAsync(this);
  }

  @BeforeUpdate()
  async validateUpdate() {
    await validateOrReject(this, { skipMissingProperties: true });

    return sanitizeAsync(this);
  }
}
