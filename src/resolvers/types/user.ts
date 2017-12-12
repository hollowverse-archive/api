import { User } from '../../database/entities/user';
import { connection } from '../../database/connection';
import { ResolverMap } from '../../typings/resolverMap';

export const resolvers: Partial<ResolverMap> = {
  User: {
    async photoUrl({ id }, _, { userPhotoUrlLoader }) {
      if (id) {
        const db = await connection;
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
