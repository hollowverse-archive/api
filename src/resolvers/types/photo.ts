import { ResolverMap } from '../../typings/resolverMap';
import { connection } from '../../database/connection';
import { Photo } from '../../database/entities/Photo';

export const resolvers: Partial<ResolverMap> = {
  Photo: {
    async url({ id }, _, { photoUrlLoader }) {
      return photoUrlLoader.load(id);
    },

    async colorPalette({ id }) {
      if (id) {
        const db = await connection;
        const photos = db.getRepository(Photo);
        const photo = await photos.findOneById(id);
        if (photo) {
          return photo.colorPalette;
        }
      }

      throw new TypeError('Photo must have an `id` to get `colorPalette`');
    }
  },
};
