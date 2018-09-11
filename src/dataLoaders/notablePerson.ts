import bluebird from 'bluebird';
import DataLoader from 'dataloader';
import { NotablePerson } from '../database/entities/NotablePerson';
import { SchemaContext } from '../typings/schemaContext';

export const createNotablePersonBySlugLoader = ({
  connection,
}: Pick<SchemaContext, 'connection'>) =>
  new DataLoader<string, NotablePerson | undefined>(async slugs => {
    return bluebird.map(
      slugs,
      async slug => {
        if (slug) {
          return connection.getRepository(NotablePerson).findOne({ slug });
        }

        return undefined;
      },
      { concurrency: 3 },
    );
  });
