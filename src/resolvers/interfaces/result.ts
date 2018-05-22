import { Result } from '../../typings/schema';
import { InterfaceResolverMap } from '../../typings/resolverMap';

export const resolvers: Pick<InterfaceResolverMap, 'Result'> = {
  Result: {
    __resolveType(obj: Result) {
      if (obj.state === 'error') {
        return 'ErrorResult';
      }

      return 'GenericSuccessResult';
    },
  },
};
