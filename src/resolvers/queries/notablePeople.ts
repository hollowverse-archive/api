import { FindManyOptions } from 'typeorm';
import { NotablePerson } from '../../database/entities/NotablePerson';
import { ResolverMap } from '../../typings/resolverMap';

export const resolvers: Partial<ResolverMap> = {
  RootQuery: {
    async notablePeople(_, { after, first }, { connection }) {
      const skip = typeof after === 'string' ? (Number(after) || 0) + 1 : 0;
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

      const edges = people.map((person, i) => ({
        node: person,
        cursor: String(i + skip),
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage: skip + people.length < all,
          endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
        },
      };
    },
  },
};
