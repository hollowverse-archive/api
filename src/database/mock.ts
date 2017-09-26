import { connection } from './connection';
import { NotablePerson } from './entities/notablePerson';
import { User } from './entities/user';
import { Event } from './entities/event';
import { Comment } from './entities/comment';
import { Label } from './entities/label';
import * as Chance from 'chance';
import { times, kebabCase } from 'lodash';
import { isUsingProductionDatabase } from './env';

if (isUsingProductionDatabase === false) {
  const chance = new Chance();
  connection
    .then(async db => {
      const users = times(10, () => {
        const user = new User();
        user.email = chance.email();
        user.photoUrl = chance.url({ protocol: 'https' });
        user.signedUpAt = chance.date();
        user.name = chance.name();
        user.fbId = chance.android_id();

        return user;
      });

      await db.entityManager.persist(users);

      const people = times(100, () => {
        const notablePerson = new NotablePerson();
        notablePerson.name = chance.name();
        notablePerson.slug = kebabCase(notablePerson.name);
        notablePerson.photoUrl = chance.url({ protocol: 'https' });
        notablePerson.labels = times(2, () => {
          const label = new Label();
          label.notablePerson = notablePerson;
          label.createdAt = chance.date();
          label.text = chance.word({ syllables: 5 });

          return label;
        });

        return notablePerson;
      });

      await db.entityManager.persist(people);

      const events = times(1000, () => {
        const event = new Event();
        event.happenedOn = chance.date();
        event.postedAt = new Date();
        event.isQuoteByNotablePerson = chance.bool();
        event.sourceUrl = chance.url({ protocol: 'https' });
        event.quote = chance.sentence({ words: 10 });
        event.notablePerson = chance.pickone(people);
        event.owner = chance.pickone(users);

        return event;
      });

      await db.entityManager.persist(events);

      const comments = times(10, () => {
        const comment = new Comment();
        comment.postedAt = new Date();
        comment.owner = chance.pickone(users);
        comment.event = chance.pickone(events);
        comment.text = chance.sentence({ words: 7 });

        return comment;
      });

      await db.entityManager.persist(comments);
    })
    .catch(e => {
      console.error('Error inserting mock data:', e.message);
    });
} else {
  console.warn(
    'Mock data was not inserted because the app is configured to use ' +
      'the production database ',
  );
}
