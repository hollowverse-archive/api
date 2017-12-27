import { FindManyOptions } from 'typeorm';
import { connection } from '../../database/connection';
import { NotablePerson } from '../../database/entities/NotablePerson';
import { ResolverMap } from '../../typings/resolverMap';

export const resolvers: Partial<ResolverMap> = {
  RootQuery: {
    async notablePeople(_, { after, first }) {
      const skip = (Number(after) || 0) + 1;
      const db = await connection;
      const query: FindManyOptions<NotablePerson> = {
        order: {
          addedOn: 'DESC',
        },
      };
      const notablePeople = db.getRepository(NotablePerson);

      const [people, all] = await notablePeople.findAndCount({
        ...query,
        take: first,
        skip,
      });

      return {
        edges: people.map((person, i) => ({
          node: person,
          cursor: i + skip,
        })),
        pageInfo: {
          hasNextPage: skip + people.length < all,
        },
      };
    },
  },
};
