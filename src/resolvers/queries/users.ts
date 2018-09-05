import { User } from '../../database/entities/User';
import { User as NodeType } from '../../typings/schema';
import { ResolverMap } from '../../typings/resolverMap';
import { createConnectionResolverFromEntity } from '../../helpers/createConnectionResolverFromEntity';

export const resolvers: Partial<ResolverMap> = {
  RootQuery: {
    users: createConnectionResolverFromEntity<typeof User, NodeType>(User, {
      signedUpAt: 'DESC',
    }) as any,
  },
};
