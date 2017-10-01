import { connection } from '../database/connection';
import { NotablePerson } from '../database/entities/notablePerson';
import { User } from '../database/entities/user';
import { NotablePersonEvent } from '../database/entities/event';
import { NotablePersonEventComment } from '../database/entities/comment';
import { NotablePersonLabel } from '../database/entities/label';
import { readJson } from '../helpers/readJson';
import * as path from 'path';
import { findKey } from 'lodash';
import * as uuid from 'uuid/v4';

type FirebaseExport = {
  notablePersons: {
    [x: string]: {
      name: string;
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
  users: {
    [id: string]: {
      displayName: string;
    };
  };
};

connection
  .then(async db => {
    const users = db.getRepository(User);
    let user = await users.findOne({ email: 'editor@hollowverse.com' });

    if (!user) {
      user = new User();
      user.id = uuid();
      user.fbId = '';
      user.email = 'editor@hollowverse.com';
      user.name = 'Hollowverse Editor';
      user.signedUpAt = new Date();
      await users.persist(user);
    }

    const json = await readJson<FirebaseExport>(
      path.resolve(__dirname, 'firebase.json'),
    );

    return Promise.all(
      Object.entries(
        json.notablePersons,
      ).map(async ([id, { name, labels, events }]) => {
        const np = new NotablePerson();
        np.id = uuid();
        np.name = name;
        np.slug = findKey(json.slugToID, v => v === id)!;
        np.photoId = np.slug;

        np.labels = await db.entityManager.save(
          labels.map(text => {
            const label = new NotablePersonLabel();
            label.id = uuid();
            label.text = text;
            label.createdAt = new Date();
            return label;
          }),
        );

        await db.entityManager.save(np);

        await db.entityManager.save(
          events.map(ev => {
            const event = new NotablePersonEvent();
            event.id = uuid();
            event.sourceUrl = ev.sourceUrl;
            event.isQuoteByNotablePerson = ev.isQuoteByNotablePerson || false;
            event.quote = ev.quote;
            event.happenedOn = ev.happenedOn ? new Date(ev.happenedOn) : null;
            event.owner = user!;
            event.postedAt = new Date(ev.postedAt);
            event.notablePerson = np;

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

        return np;
      }),
    );
  })
  .then(() => {
    console.info('Firebase data imported successfully');
    process.exit(0);
  })
  .catch(e => {
    console.error('Error importing data:', e.message);
    process.exit(1);
  });
