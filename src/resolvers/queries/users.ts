import { FindManyOptions } from 'typeorm';
import { User } from '../../database/entities/User';
import { ResolverMap } from '../../typings/resolverMap';

export const resolvers: Partial<ResolverMap> = {
  RootQuery: {
    async users(_, { after, first, where }, { connection }) {
      const skip = Number(after) || 0;
      const query: FindManyOptions<User> = {
        where: { ...where },
        order: {
          signedUpAt: 'DESC',
        },
      };
      const usersRepo = connection.getRepository(User);

      const [users, all] = await usersRepo.findAndCount({
        ...query,
        take: first,
        skip,
      });

      return {
        edges: users.map((user, i) => ({
          node: user,
          cursor: i + skip,
        })),
        pageInfo: {
          hasNextPage: skip + users.length < all,
        },
      };
    },
  },
};
