import { FindManyOptions } from 'typeorm';
import { NotablePersonEvent } from '../../database/entities/NotablePersonEvent';
import { ResolverMap } from '../../typings/resolverMap';

export const resolvers: Partial<ResolverMap> = {
  RootQuery: {
    async notablePeopleEvents(_, { after, first }, { connection }) {
      const skip = (Number(after) || 0) + 1;
      const query: FindManyOptions<NotablePersonEvent> = {
        order: {
          postedAt: 'DESC',
        },
      };
      const notablePeopleEvents = connection.getRepository(NotablePersonEvent);

      const [events, all] = await notablePeopleEvents.findAndCount({
        ...query,
        take: first,
        skip,
      });

      return {
        edges: events.map((person, i) => ({
          node: person,
          cursor: i + skip,
        })),
        pageInfo: {
          hasNextPage: skip + events.length < all,
        },
      };
    },
  },
};
