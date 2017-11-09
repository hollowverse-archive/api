import { User } from '../../database/entities/user';
import { SchemaContext } from '../../typings/schemaContext';

export const userResolvers = {
  User: {
    async photoUrl(
      { fbId }: User,
      _: undefined,
      { userPhotoUrlLoader }: SchemaContext,
    ) {
      return userPhotoUrlLoader.load(fbId);
    },
  },
};
