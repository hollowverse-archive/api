import { FindManyOptions } from 'typeorm';
import { User } from '../../database/entities/User';
import { ResolverMap } from '../../typings/resolverMap';

export const resolvers: Partial<ResolverMap> = {
  RootQuery: {
    async users(_, { after, first, where }, { connection }) {
      const skip = typeof after === 'string' ? (Number(after) || 0) + 1 : 0;
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

      const edges = users.map((user, i) => ({
        node: user,
        cursor: String(i + skip),
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage: skip + users.length < all,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        },
      };
    },
  },
};
