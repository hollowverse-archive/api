import { User } from '../../database/entities/User';
import { ResolverMap } from '../../typings/resolverMap';

export const resolvers: Partial<ResolverMap> = {
  User: {
    async photoUrl({ id }, _, { userPhotoUrlLoader, connection }) {
      if (id) {
        const db = connection;
        const users = db.getRepository(User);
        const user = await users.findOne({ where: { id }, select: ['fbId'] });
        if (user) {
          return userPhotoUrlLoader.load(user.fbId);
        }
      }

      return null;
    },
  },
};
