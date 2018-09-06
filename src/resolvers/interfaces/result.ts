import { Result } from '../../typings/schema';
import { InterfaceResolverMap } from '../../typings/resolverMap';

export const resolvers: Pick<InterfaceResolverMap, 'Result'> = {
  Result: {
    /* tslint:disable-next-line function-name */
    __resolveType(obj: Result) {
      if (obj.state === 'ERROR') {
        return 'ErrorResult';
      }

      return 'GenericSuccessResult';
    },
  },
};
