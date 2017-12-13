import { connection } from '../../database/connection';
import { NotablePerson } from '../../database/entities/NotablePerson';
import { NotablePersonEvent } from '../../database/entities/NotablePersonEvent';
import { NotablePersonEventComment } from '../../database/entities/NotablePersonEventComment';
import { EditorialSummaryNode } from '../../database/entities/EditorialSummaryNode';
import { ResolverMap } from '../../typings/resolverMap';

export const resolvers: Partial<ResolverMap> = {
  RootQuery: {
    async notablePerson(_, { slug }) {
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
    async events({ slug }, args) {
      const db = await connection;

      const events = db.getRepository(NotablePersonEvent);
      const notablePeople = db.getRepository(NotablePerson);
      const notablePerson = await notablePeople.findOne({ slug });

      if (notablePerson) {
        return events.find({
          where: {
            ...args.query,
            notablePersonId: notablePerson.id,
          },
          order: {
            postedAt: 'DESC',
          },
          relations: ['labels'],
        });
      }

      return [];
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

    async photoUrl({ slug }) {
      const db = await connection;
      const notablePeople = db.getRepository(NotablePerson);
      const person = await notablePeople.findOne({ slug });
      if (person) {
        const { photoId } = person;
        if (photoId) {
          new URL(
            `notable-people/${photoId}`,
            'https://files.hollowverse.com',
          ).toString();
        }
      }

      return null;
    },

    async commentsUrl({ slug }) {
      if (slug) {
        const db = await connection;
        const notablePeople = db.getRepository(NotablePerson);
        const person = await notablePeople.findOne({ slug });
        if (person) {
          const { oldSlug } = person;

          if (oldSlug !== null) {
            return new URL(
              `${oldSlug}/`,
              // tslint:disable-next-line:no-http-string
              'http://hollowverse.com',
            ).toString();
          } else {
            return new URL(`${slug}`, 'https://hollowverse.com').toString();
          }
        }
      }

      throw new TypeError();
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
