import { SchemaContext } from '../../typings/schemaContext';

export const viewerResolvers = {
  Viewer: {
    async photoUrl(
      _: undefined,
      __: object,
      { viewer, userPhotoUrlLoader }: SchemaContext,
    ) {
      if (viewer) {
        return userPhotoUrlLoader.load(viewer.fbId);
      }

      return undefined;
    },
  },
};
