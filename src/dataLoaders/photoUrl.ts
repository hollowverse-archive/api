import DataLoader from 'dataloader';

import { Photo } from '../database/entities/Photo';
import { URL } from 'url';
import { Connection } from 'typeorm';

export const createPhotoUrlLoader = (connection: Connection) =>
  new DataLoader<string | undefined, string>(async ids => {
    const db = await connection;

    return Promise.all(
      ids.map(async id => {
        if (id) {
          const photos = db.getRepository(Photo);

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
