import { NotablePerson } from '../../database/entities/NotablePerson';
import { createConnectionResolverFromEntity } from '../../helpers/createConnectionResolverFromEntity';
import { ResolverMap } from '../../typings/resolverMap';
import { NotablePerson as NodeType } from '../../typings/schema';

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
