import { User } from '../../database/entities/User';
import { createConnectionResolverFromEntity } from '../../helpers/createConnectionResolverFromEntity';
import { ResolverMap } from '../../typings/resolverMap';
import { User as NodeType } from '../../typings/schema';

export const resolvers: Partial<ResolverMap> = {
  RootQuery: {
    users: createConnectionResolverFromEntity<typeof User, NodeType>(User, {
      signedUpAt: 'DESC',
    }) as any,
  },
};
