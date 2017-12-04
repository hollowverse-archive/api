// tslint:disable no-console no-non-null-assertion max-func-body-length

import { connection } from '../database/connection';
import { NotablePerson } from '../database/entities/notablePerson';
import { User } from '../database/entities/user';
import { NotablePersonEvent } from '../database/entities/event';
import { NotablePersonEventComment } from '../database/entities/comment';
import { NotablePersonLabel } from '../database/entities/notablePersonLabel';
import { EventLabel } from '../database/entities/eventLabel';
import { readJson } from '../helpers/readFile';
import { findKey, intersectionWith } from 'lodash';
import * as uuid from 'uuid/v4';

type FirebaseExport = {
  notablePersons: {
    [x: string]: {
      name: string;
      summary: string | null;
      labels: string[];
      photoUrl: string;
      oldSlug: string;
      events: [
        {
          id: number;
          isQuoteByNotablePerson?: true;
          quote: string;
          postedAt: number;
          labels: string[];
          happenedOn?: number;
          sourceName: string;
          sourceUrl: string;
          userComment: string;
          userId: string;
        }
      ];
    };
  };
  slugToID: {
    [slug: string]: string;
  };
};

connection
  .then(async db =>
    db.transaction(async entityManager => {
      const users = db.getRepository(User);
      let user = await users.findOne({ email: 'editor@hollowverse.com' });

      if (!user) {
        user = new User();
        user.id = uuid();
        user.fbId = '116989929051706';
        user.email = 'editor@hollowverse.com';
        user.name = 'Hollowverse Editor';
        user.signedUpAt = new Date();
        await entityManager.save(user);
      }

      const json = await readJson<FirebaseExport>('firebaseExport.json');

      const eventLabels = new Set<string>();
      Object.values(json.notablePersons).forEach(np => {
        np.events.forEach(e => {
          e.labels.forEach(text => {
            eventLabels.add(text);
          });
        });
      });

      const savedEventLabels = await entityManager.save(
        Array.from(eventLabels.values()).map(text => {
          const label = new EventLabel();
          label.id = uuid();
          label.createdAt = new Date();
          label.text = text;

          return label;
        }),
      );

      return Promise.all(
        Object.entries(
          json.notablePersons,
        ).map(async ([id, { name, labels, events, summary, oldSlug }]) => {
          const notablePerson = new NotablePerson();
          notablePerson.id = uuid();
          notablePerson.name = name;
          notablePerson.slug = findKey(json.slugToID, v => v === id)!;
          notablePerson.summary = summary;
          notablePerson.oldSlug = oldSlug;

          notablePerson.labels = await entityManager.save(
            labels.map(text => {
              const label = new NotablePersonLabel();
              label.id = uuid();
              label.text = text;
              label.createdAt = new Date();

              return label;
            }),
          );

          await entityManager.save(notablePerson);

          await entityManager.save(
            await Promise.all(
              events
                .filter(event => event.isQuoteByNotablePerson === true)
                .map(async ev => {
                  const event = new NotablePersonEvent();
                  event.id = uuid();
                  event.type = 'quote';
                  event.labels = [];
                  event.sourceUrl = ev.sourceUrl;
                  event.isQuoteByNotablePerson =
                    ev.isQuoteByNotablePerson || false;
                  event.quote = ev.quote;
                  event.happenedOn = ev.happenedOn
                    ? new Date(ev.happenedOn)
                    : null;
                  event.owner = user!;
                  event.postedAt = new Date(ev.postedAt);
                  event.notablePerson = notablePerson;

                  event.labels = intersectionWith(
                    savedEventLabels,
                    ev.labels,
                    (a: EventLabel, text: string) => a.text === text,
                  );

                  const comment = new NotablePersonEventComment();
                  comment.id = uuid();
                  comment.event = event;
                  comment.text = ev.userComment;
                  comment.owner = user!;
                  comment.postedAt = new Date(ev.postedAt);

                  event.comments = [comment];

                  return event;
                }),
            ),
          );

          return notablePerson;
        }),
      );
    }),
  )
  .then(() => {
    console.info('Firebase data imported successfully');
    process.exit(0);
  })
  .catch(e => {
    console.error('Error importing data:', e.message || e);
    process.exit(1);
  });
