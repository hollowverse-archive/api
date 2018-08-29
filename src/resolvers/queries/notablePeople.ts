import { FindManyOptions } from 'typeorm';
import { NotablePerson } from '../../database/entities/NotablePerson';
import { ResolverMap } from '../../typings/resolverMap';

export const resolvers: Partial<ResolverMap> = {
  RootQuery: {
    async notablePeople(_, { after, first }, { connection }) {
      const skip = Number(after) || 0;
      const query: FindManyOptions<NotablePerson> = {
        order: {
          addedOn: 'DESC',
        },
      };
      const notablePeople = connection.getRepository(NotablePerson);

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
