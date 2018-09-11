// tslint:disable no-console max-func-body-length no-implicit-dependencies
/* eslint-disable no-console */
import { isProd } from '@hollowverse/utils/helpers/env';
import faker from 'faker';
import { take, times, uniqBy } from 'lodash';
import { connectionPromise } from '../database/connection';
import { EventLabel } from '../database/entities/EventLabel';
import { NotablePerson } from '../database/entities/NotablePerson';
import { NotablePersonEvent } from '../database/entities/NotablePersonEvent';
import { NotablePersonEventComment } from '../database/entities/NotablePersonEventComment';
import { NotablePersonLabel } from '../database/entities/NotablePersonLabel';
import { User } from '../database/entities/User';

if (isProd === false) {
  faker.seed(Number(process.env.SEED) || 1);
  connectionPromise
    .then(async db =>
      db.transaction(async entityManager => {
        const users = times(10, () => {
          const user = new User();
          user.id = faker.random.uuid();
          user.email = faker.internet.email();
          user.photoId = faker.internet.url();
          user.signedUpAt = faker.date.past();
          user.name = faker.fake('{{name.firstName}} {{name.lastName}}');
          user.fbId = faker.random.uuid();

          return user;
        });

        await entityManager.save(users);

        const notablePersonLabels = await entityManager.save(
          uniqBy(
            times(100, () => {
              const label = new NotablePersonLabel();
              label.id = faker.random.uuid();
              label.createdAt = faker.date.past();
              label.text = faker.lorem.word();

              return label;
            }),
            label => label.text,
          ),
        );

        const notablePeople = await Promise.all(
          times(100, async () => {
            const notablePerson = new NotablePerson();
            notablePerson.id = faker.random.uuid();
            notablePerson.name = faker.fake(
              '{{name.firstName}} {{name.lastName}}',
            );
            notablePerson.summary = faker.lorem.paragraphs(2);
            notablePerson.slug = notablePerson.name.replace(/\s/g, '_');
            notablePerson.photoId = faker.helpers.randomize([
              null,
              faker.random.uuid(),
            ]);
            notablePerson.labels = Promise.resolve(
              take(
                faker.helpers.shuffle(notablePersonLabels),
                Math.min(4, faker.random.number(notablePersonLabels.length)),
              ),
            );

            return notablePerson;
          }),
        );

        await entityManager.save(notablePeople);

        const eventLabels = await entityManager.save(
          uniqBy(
            times(100, () => {
              const label = new EventLabel();
              label.id = faker.random.uuid();
              label.createdAt = faker.date.past();
              label.text = faker.lorem.word();

              return label;
            }),
            label => label.text,
          ),
        );

        const events = times(1000, () => {
          const event = new NotablePersonEvent();
          event.id = faker.random.uuid();
          event.happenedOn = faker.date.past();
          event.postedAt = new Date();
          event.type = faker.helpers.randomize<(typeof event)['type']>([
            'DONATION',
            'QUOTE',
            'APPEARANCE',
          ]);
          const quote = faker.lorem.sentence();
          event.quote =
            event.type === 'QUOTE'
              ? quote
              : faker.helpers.randomize([quote, null]);
          event.isQuoteByNotablePerson = event.quote
            ? faker.random.boolean()
            : null;
          event.sourceUrl = faker.internet.url();

          const entityName = faker.company.companyName();
          event.organizationName =
            event.type !== 'QUOTE'
              ? entityName
              : faker.helpers.randomize([null, entityName]);

          event.organizationWebsiteUrl = event.organizationName
            ? faker.helpers.randomize([null, faker.internet.url()])
            : null;

          event.notablePerson = faker.helpers.randomize(notablePeople);
          event.submittedBy = faker.helpers.randomize(users);
          event.labels = take(
            faker.helpers.shuffle(eventLabels),
            Math.min(4, faker.random.number(eventLabels.length)),
          );

          return event;
        });

        await entityManager.save(events);

        const comments = times(10, () => {
          const comment = new NotablePersonEventComment();
          comment.id = faker.random.uuid();
          comment.postedAt = faker.date.recent();
          comment.owner = faker.helpers.randomize(users);
          comment.event = faker.helpers.randomize(events);
          comment.text = faker.lorem.sentences();

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
