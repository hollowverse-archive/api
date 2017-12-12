import { SchemaContext } from '../../typings/schemaContext';
import { ResolverMap } from '../../typings/resolverMap';

export const resolvers: Partial<ResolverMap> = {
  Viewer: async (_, __, context) => {
    if (context.viewer) {
      return {
        ...context.viewer,
        photoUrl: await context.userPhotoUrlLoader.load(context.viewer.fbId),
      };
    }

    return undefined;
  },
};

export async function viewer(_: undefined, __: any, context: SchemaContext) {
  return context.viewer;
}
