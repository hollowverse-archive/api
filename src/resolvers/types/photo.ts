import { ResolverMap } from '../../typings/resolverMap';

export const resolvers: Partial<ResolverMap> = {
  Photo: {
    async url({ id }, _, { photoUrlLoader }) {
      return photoUrlLoader.load(id);
    },
  },
};
