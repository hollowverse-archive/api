import { connection } from '../../database/connection';
import { NotablePerson } from '../../database/entities/NotablePerson';
import { NotablePersonEvent } from '../../database/entities/NotablePersonEvent';
import { NotablePersonEventComment } from '../../database/entities/NotablePersonEventComment';
import { EditorialSummaryNode } from '../../database/entities/EditorialSummaryNode';
import { ResolverMap } from '../../typings/resolverMap';
import { URL } from 'url';

export const resolvers: Partial<ResolverMap> = {
  RootQuery: {
    async notablePerson(_, { slug }) {
      const db = await connection;
      const npRepository = db.getRepository(NotablePerson);

      return npRepository.findOne({
        where: { slug },
        relations: ['labels', 'relatedPeople', 'mainPhoto'],
      });
    },
  },
  NotablePerson: {
    async events({ slug }, args, { notablePersonBySlugLoader }) {
      if (slug) {
        const notablePerson = await notablePersonBySlugLoader.load(slug);
        if (notablePerson) {
          const db = await connection;
          const events = db.getRepository(NotablePersonEvent);

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

    async photoUrl({ slug }, _, { notablePersonBySlugLoader }) {
      if (slug) {
        const notablePerson = await notablePersonBySlugLoader.load(slug);
        if (notablePerson) {
          const { photoId } = notablePerson;
          if (photoId) {
            return new URL(
              `notable-people/${photoId}`,
              'https://files.hollowverse.com',
            ).toString();
          }
        }
      }

      return null;
    },

    async commentsUrl({ slug }, _, { notablePersonBySlugLoader }) {
      if (slug) {
        const notablePerson = await notablePersonBySlugLoader.load(slug);
        if (notablePerson) {
          const { oldSlug } = notablePerson;

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
