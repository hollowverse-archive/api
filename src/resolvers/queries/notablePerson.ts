import { connection } from '../../database/connection';
import { NotablePerson } from '../../database/entities/notablePerson';
import { NotablePersonEvent } from '../../database/entities/event';
import { NotablePersonEventComment } from '../../database/entities/comment';
import { EditorialSummaryNode } from '../../database/entities/editorialSummaryNode';
import { ResolverMap } from '../../typings/resolverMap';

export const resolvers: Partial<ResolverMap> = {
  RootQuery: {
    async notablePerson(_, { slug }) {
      const db = await connection;
      const npRepository = db.getRepository(NotablePerson);

      return (
        (await npRepository.findOne({
          where: {
            slug,
          },
          relations: ['labels'],
        })) || null
      );
    },
  },
  NotablePerson: {
    async events(notablePerson, args) {
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

    async editorialSummary(notablePerson) {
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
    async comments(event) {
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
