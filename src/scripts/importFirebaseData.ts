// tslint:disable no-console no-non-null-assertion

import { connection } from '../database/connection';
import { NotablePerson } from '../database/entities/notablePerson';
import { User } from '../database/entities/user';
import { NotablePersonEvent } from '../database/entities/event';
import { NotablePersonEventComment } from '../database/entities/comment';
import { NotablePersonLabel } from '../database/entities/label';
import { readJson } from '../helpers/readFile';
import { findKey } from 'lodash';
import * as uuid from 'uuid/v4';

type FirebaseExport = {
  notablePersons: {
    [x: string]: {
      name: string;
      summary: string | null;
      labels: string[];
      photoUrl: string;
      events: [
        {
          id: number;
          isQuoteByNotablePerson?: true;
          quote: string;
          postedAt: number;
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

      return Promise.all(
        Object.entries(
          json.notablePersons,
        ).map(async ([id, { name, labels, events, summary }]) => {
          const notablePerson = new NotablePerson();
          notablePerson.id = uuid();
          notablePerson.name = name;
          notablePerson.slug = findKey(json.slugToID, v => v === id)!;
          notablePerson.photoId = notablePerson.slug;
          notablePerson.summary = summary;

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
            events.map(ev => {
              const event = new NotablePersonEvent();
              event.id = uuid();
              event.sourceUrl = ev.sourceUrl;
              event.isQuoteByNotablePerson = ev.isQuoteByNotablePerson || false;
              event.quote = ev.quote;
              event.happenedOn = ev.happenedOn ? new Date(ev.happenedOn) : null;
              event.owner = user!;
              event.postedAt = new Date(ev.postedAt);
              event.notablePerson = notablePerson;

              const comment = new NotablePersonEventComment();
              comment.id = uuid();
              comment.event = event;
              comment.text = ev.userComment;
              comment.owner = user!;
              comment.postedAt = new Date(ev.postedAt);

              event.comments = [comment];

              return event;
            }),
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
