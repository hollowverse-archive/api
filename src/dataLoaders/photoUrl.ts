import DataLoader from 'dataloader';

import { Photo } from '../database/entities/Photo';
import { URL } from 'url';
import { SchemaContext } from '../typings/schemaContext';

export const createPhotoUrlLoader = ({
  connection,
}: Pick<SchemaContext, 'connection'>) =>
  new DataLoader<string | undefined, string>(async ids => {
    return Promise.all(
      ids.map(async id => {
        if (id) {
          const photos = connection.getRepository(Photo);

          const photo = await photos.findOne({ id });
          if (photo) {
            return String(
              new URL(photo.s3Path, 'https://photos.hollowverse.com'),
            );
          }
        }

        throw new TypeError('Expected `Photo` to have an `id`');
      }),
    );
  });
