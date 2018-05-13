import { UnionResolverMap } from '../../typings/resolverMap';

export const resolvers: Pick<UnionResolverMap, 'Result'> = {
  Result: {
    __resolveType(obj) {
      if (obj.state === 'success') {
        return 'SuccessResult';
      }

      return 'ErrorResult';
    },
  },
};
