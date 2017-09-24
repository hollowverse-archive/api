import { connection } from './connection';
import { NotablePerson } from './entities/notablePerson';
import { Event } from './entities/event';
import * as Chance from 'chance';
import { times, kebabCase } from 'lodash';

const chance = new Chance();

connection.then(async db => {
  const notablePersonRepository = db.getRepository(NotablePerson);

  const people = times(100, () => {
    const notablePerson = new NotablePerson();
    notablePerson.name = chance.name();
    notablePerson.slug = kebabCase(notablePerson.name);

    notablePerson.events = times(10, () => {
      const event = new Event();
      event.happenedOn = chance.date();
      event.addedAt = new Date();
      event.isQuoteByNotablePerson = chance.bool();
      event.sourceUrl = chance.url();
      event.text = chance.sentence({ words: 10 });
      event.notablePerson = notablePerson;

      return event;
    });

    return notablePerson;
  });

  await notablePersonRepository.persist(people);
});
