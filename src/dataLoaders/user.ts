import * as DataLoader from 'dataloader';

import { getPhotoUrlByFbId } from '../helpers/facebook';

export const userPhotoUrlLoader = new DataLoader<
  string,
  string
>(async fbIds => {
  return Promise.all(
    fbIds.map(async fbId => getPhotoUrlByFbId(fbId, 'normal')),
  );
});
