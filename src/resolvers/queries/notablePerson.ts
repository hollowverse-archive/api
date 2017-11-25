import { connection } from '../../database/connection';
import { NotablePerson } from '../../database/entities/notablePerson';
import { NotablePersonEvent } from '../../database/entities/event';
import { NotablePersonEventComment } from '../../database/entities/comment';
import {
  NotablePersonRootQueryArgs,
  EventsNotablePersonArgs,
} from '../../typings/schema';

export const notablePersonResolvers = {
  RootQuery: {
    async notablePerson(_: undefined, { slug }: NotablePersonRootQueryArgs) {
      const db = await connection;
      const npRepository = db.getRepository(NotablePerson);

      return npRepository.findOne({
        where: {
          slug,
        },
        relations: ['labels'],
      });
    },
  },

  NotablePerson: {
    async events(notablePerson: NotablePerson, args: EventsNotablePersonArgs) {
      const db = await connection;

      const repo = db.getRepository(NotablePersonEvent);

      return repo.find({
        where: {
          ...args.query,
          notablePersonId: notablePerson.id,
        },
        order: {
          postedAt: 'DESC',
        },
        relations: ['labels'],
      });
    },
  },

  NotablePersonEvent: {
    async comments(event: NotablePersonEvent) {
      const db = await connection;

      const repo = db.getRepository(NotablePersonEventComment);

      return repo.find({
        where: {
          eventId: event.id,
        },
        relations: ['owner'],
      });
    },
  },
};
