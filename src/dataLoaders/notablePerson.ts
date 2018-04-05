import DataLoader from 'dataloader';

import { NotablePerson } from '../database/entities/NotablePerson';
import { Connection } from 'typeorm';

export const createNotablePersonBySlugLoader = (connection: Connection) =>
  new DataLoader<string, NotablePerson | undefined>(async slugs => {
    return Promise.all(
      slugs.map(async slug => {
        if (slug) {
          return connection.getRepository(NotablePerson).findOne({ slug });
        }

        return undefined;
      }),
    );
  });
