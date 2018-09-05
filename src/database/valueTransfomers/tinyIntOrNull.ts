type Transform<DatabaseType, EntityType> = {
  from(value: DatabaseType): EntityType;
  to(value: EntityType): DatabaseType;
};

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
