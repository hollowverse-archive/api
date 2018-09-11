import { NotablePersonEvent } from '../../database/entities/NotablePersonEvent';
import { createConnectionResolverFromEntity } from '../../helpers/createConnectionResolverFromEntity';
import { ResolverMap } from '../../typings/resolverMap';
import { NotablePersonEventType as NodeType } from '../../typings/schema';

export const resolvers: Partial<ResolverMap> = {
  RootQuery: {
    notablePeopleEvents: createConnectionResolverFromEntity<
      typeof NotablePersonEvent,
      NodeType
    >(NotablePersonEvent, {
      postedAt: 'DESC',
    }) as any,
  },
};
