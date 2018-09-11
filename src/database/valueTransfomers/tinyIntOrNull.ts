type Transform<DatabaseType, EntityType> = {
  from(value: DatabaseType): EntityType;
  to(value: EntityType): DatabaseType;
};

/**
 * MySQL does not have a native boolean type, and `tinyint` is used instead.
 * A custom value transformer is needed to transform values between
 * JavaScript's `boolean` and MySQL's `tinyint`
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
