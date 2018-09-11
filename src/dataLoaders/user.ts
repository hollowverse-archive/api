import bluebird from 'bluebird';
import DataLoader from 'dataloader';
import { SchemaContext } from '../typings/schemaContext';

export const createUserPhotoUrlLoader = ({
  authProvider,
}: Pick<SchemaContext, 'authProvider'>) =>
  new DataLoader<string, string>(async fbIds => {
    return bluebird.map(
      fbIds,
      async fbId => authProvider.getPhotoUrlByUserId(fbId, 'normal'),
      { concurrency: 3 },
    );
  });
