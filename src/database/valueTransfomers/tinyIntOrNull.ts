type Transform<DatabaseType, EntityType> = {
  from(value: DatabaseType): EntityType;
  to(value: EntityType): DatabaseType;
};

/**
 * MySQL does not have a native boolean type, and `tinyint`,
 * which can only be 0 or 1, is used instead.
 * TypeORM can handle the transformation between MySQL's
 * `tinyint` and JavaScript's `boolean` automatically,
 * but not when the type is also nullable.
 * A custom value transformer is needed when a boolean type
 * is nullable.
 */
export const transformTinyIntOrNull: Transform<
  number | null,
  boolean | null
> = {
  from(value) {
    if (value === null) {
      return null;
    }

    return Boolean(value);
  },
  to(value) {
    if (value === null) {
      return null;
    }

    return value === true ? 1 : 0;
  },
};
