// tslint:disable no-console
import * as uuid from 'uuid/v4';
import { connection } from '../database/connection';
import { NotablePerson } from '../database/entities/notablePerson';
import { User } from '../database/entities/user';
import { NotablePersonEvent, EventType } from '../database/entities/event';
import { NotablePersonEventComment } from '../database/entities/comment';
import { NotablePersonLabel } from '../database/entities/notablePersonLabel';
import { EventLabel } from '../database/entities/eventLabel';
import * as Chance from 'chance';
import { times } from 'lodash';
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
            notablePerson.slug = notablePerson.name.replace(/\s/g, '_');
            notablePerson.photoId = chance.apple_token();
            notablePerson.commentsUrl = chance.url();
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

        const eventLabels = await entityManager.save(
          times(15, () => {
            const label = new EventLabel();
            label.id = uuid();
            label.createdAt = chance.date();
            label.text = chance.word({ syllables: 5 });

            return label;
          }),
        );

        const events = times(1000, () => {
          const event = new NotablePersonEvent();
          event.id = uuid();
          event.happenedOn = chance.date();
          event.postedAt = new Date();
          event.type = chance.pickone<EventType>([
            'donation',
            'quote',
            'appearance',
          ]);
          const quote = chance.sentence({ words: 10 });
          event.quote =
            event.type === 'quote' ? quote : chance.pickone([quote, null]);
          event.isQuoteByNotablePerson = event.quote ? chance.bool() : null;
          event.sourceUrl = chance.url({ protocol: 'https' });
          event.entityName = chance.pickone([
            null,
            chance.sentence({ words: chance.integer({ min: 1, max: 1 }) }),
          ]);
          event.entityUrl = event.entityName
            ? chance.pickone([null, chance.url({ protocol: 'http' })])
            : null;
          event.notablePerson = chance.pickone(notablePeople);
          event.owner = chance.pickone(users);
          event.labels = chance.pickset(eventLabels);

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
      console.error('Error inserting mock data:', e);
      process.exit(1);
    });
} else {
  console.warn(
    'Mock data was not inserted because the app is configured to use ' +
      'the production database',
  );
  process.exit(1);
}
