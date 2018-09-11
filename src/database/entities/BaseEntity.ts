import { sanitizeAsync } from '@hollowverse/class-sanitizer';
import { validateOrReject } from 'class-validator';
import { BeforeInsert, BeforeUpdate } from 'typeorm';

/**
 * Base entity for the database layer.
 *
 * All entities should extend this class to automatically
 * perform validations on insertions and updates.
 */
export class BaseEntity {
  @BeforeInsert()
  async validate() {
    await sanitizeAsync(this);

    return validateOrReject(this);
  }

  @BeforeUpdate()
  async validateUpdate() {
    await sanitizeAsync(this);

    return validateOrReject(this, { skipMissingProperties: true });
  }
}
