import { connection } from '../../database/connection';
import { NotablePerson } from '../../database/entities/notablePerson';
import { NotablePersonEvent } from '../../database/entities/event';
import { NotablePersonEventComment } from '../../database/entities/comment';
import { EditorialSummaryNode } from '../../database/entities/editorialSummaryNode';
import {
  NotablePersonRootQueryArgs,
  EventsNotablePersonArgs,
  NotablePerson as NotablePersonType,
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

    async editorialSummary(
      notablePerson: NotablePerson,
    ): Promise<NotablePersonType['editorialSummary']> {
      const editorialSummary = notablePerson.editorialSummary;

      if (editorialSummary) {
        const nodesRepo = (await connection).getRepository(
          EditorialSummaryNode,
        );

        return {
          ...editorialSummary,
          nodes: await nodesRepo.find({
            where: {
              editorialSummaryId: editorialSummary.id,
            },
            order: {
              order: 'ASC',
            },
          }),
        };
      }

      return null;
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
