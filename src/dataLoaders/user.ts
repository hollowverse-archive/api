import DataLoader from 'dataloader';

import { SchemaContext } from '../typings/schemaContext';

export const createUserPhotoUrlLoader = ({
  getPhotoUrlFromAuthProvider,
}: Pick<SchemaContext, 'getPhotoUrlFromAuthProvider'>) =>
  new DataLoader<string, string>(async fbIds => {
    return Promise.all(
      fbIds.map(async fbId => getPhotoUrlFromAuthProvider(fbId, 'normal')),
    );
  });
