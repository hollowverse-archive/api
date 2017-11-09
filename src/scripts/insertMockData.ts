// tslint:disable no-console
import * as uuid from 'uuid/v4';
import { connection } from '../database/connection';
import { NotablePerson } from '../database/entities/notablePerson';
import { User } from '../database/entities/user';
import { NotablePersonEvent } from '../database/entities/event';
import { NotablePersonEventComment } from '../database/entities/comment';
import { NotablePersonLabel } from '../database/entities/label';
import * as Chance from 'chance';
import { times, kebabCase } from 'lodash';
import { isUsingProductionDatabase } from '../env';

if (isUsingProductionDatabase === false) {
  const chance = new Chance(process.env.SEED || 1);
  connection
    .then(async db =>
      db.transaction(async entityManager => {
        const users = times(10, () => {
          const user = new User();
          user.id = uuid();
          user.email = chance.email();
          user.photoId = chance.url({ protocol: 'https' });
          user.signedUpAt = chance.date();
          user.name = chance.name();
          user.fbId = chance.android_id();

          return user;
        });

        await entityManager.save(users);

        const notablePeople = await Promise.all(
          times(100, async () => {
            const notablePerson = new NotablePerson();
            notablePerson.id = uuid();
            notablePerson.name = chance.name();
            notablePerson.summary = chance.sentence();
            notablePerson.slug = kebabCase(notablePerson.name);
            notablePerson.photoId = chance.apple_token();
            notablePerson.labels = await entityManager.save(
              times(2, () => {
                const label = new NotablePersonLabel();
                label.id = uuid();
                label.createdAt = chance.date();
                label.text = chance.word({ syllables: 5 });

                return label;
              }),
            );

            return notablePerson;
          }),
        );

        await entityManager.save(notablePeople);

        const events = times(1000, () => {
          const event = new NotablePersonEvent();
          event.id = uuid();
          event.happenedOn = chance.date();
          event.postedAt = new Date();
          event.isQuoteByNotablePerson = chance.bool();
          event.sourceUrl = chance.url({ protocol: 'https' });
          event.quote = chance.sentence({ words: 10 });
          event.notablePerson = chance.pickone(notablePeople);
          event.owner = chance.pickone(users);

          return event;
        });

        await entityManager.save(events);

        const comments = times(10, () => {
          const comment = new NotablePersonEventComment();
          comment.id = uuid();
          comment.postedAt = new Date();
          comment.owner = chance.pickone(users);
          comment.event = chance.pickone(events);
          comment.text = chance.sentence({ words: 7 });

          return comment;
        });

        await entityManager.save(comments);
      }),
    )
    .then(() => {
      console.info('Mock data inserted successfully');
      process.exit(0);
    })
    .catch(e => {
      console.error('Error inserting mock data:', e.message || e);
      process.exit(1);
    });
} else {
  console.warn(
    'Mock data was not inserted because the app is configured to use ' +
      'the production database',
  );
  process.exit(1);
}
