// tslint:disable no-console

import { notablePersonIndex } from '../algolia';
import { connection } from '../database/connection';
import { NotablePerson } from '../database/entities/NotablePerson';
import { omit } from 'lodash';

async function main() {
  const index = await notablePersonIndex;
  const db = await connection;

  const notablePeople = db.getRepository(NotablePerson);

  const allPeople = await notablePeople.find({
    select: ['name', 'slug', 'summary', 'id'],
    relations: ['labels'],
  });

  console.log(allPeople);

  await index.saveObjects(
    allPeople.map(person => {
      return {
        ...omit(person, 'id'),
        labels: person.labels.map(label => label.text),
        objectID: person.id,
      };
    }),
  );
}

main()
  .then(() => {
    console.info('Algolia index updated');
    process.exit(0);
  })
  .catch(e => {
    console.error('Failed to update Algolia index', e);
    process.exit(1);
  });
