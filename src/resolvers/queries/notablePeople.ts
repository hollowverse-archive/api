import { NotablePerson } from '../../database/entities/NotablePerson';
import { NotablePerson as NodeType } from '../../typings/schema';
import { ResolverMap } from '../../typings/resolverMap';
import { createConnectionResolverFromEntity } from '../../helpers/createConnectionResolverFromEntity';

export const resolvers: Partial<ResolverMap> = {
  RootQuery: {
    notablePeople: createConnectionResolverFromEntity<
      typeof NotablePerson,
      NodeType
    >(NotablePerson, {
      addedOn: 'DESC',
    }) as any,
  },
};
