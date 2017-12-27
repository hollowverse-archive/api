import * as DataLoader from 'dataloader';

import { NotablePerson } from '../database/entities/NotablePerson';
import { connection } from '../database/connection';

export const notablePersonBySlugLoader = new DataLoader<
  string,
  NotablePerson | undefined
>(async slugs => {
  const db = await connection;

  return Promise.all(
    slugs.map(async slug => {
      if (slug) {
        return db.getRepository(NotablePerson).findOne({ slug });
      }

      return undefined;
    }),
  );
});
