import { connection } from '../../database/connection';
import { NotablePersonEvent } from '../../database/entities/NotablePersonEvent';
import { NotablePersonEventComment } from '../../database/entities/NotablePersonEventComment';
import { EditorialSummaryNode } from '../../database/entities/EditorialSummaryNode';
import { ResolverMap } from '../../typings/resolverMap';
import { URL } from 'url';

export const resolvers: Partial<ResolverMap> = {
  RootQuery: {
    async notablePerson(_, { slug }, { notablePersonBySlugLoader }) {
      const person = await notablePersonBySlugLoader.load(slug);

      if (person) {
        const { name, summary, oldSlug } = person;

        return {
          name,
          slug,
          oldSlug,
          summary,
        };
      }

      return null;
    },
  },
  NotablePerson: {
    async labels({ slug }, _, { notablePersonBySlugLoader }) {
      if (slug) {
        const notablePerson = await notablePersonBySlugLoader.load(slug);
        if (notablePerson) {
          return await notablePerson.labels;
        }
      }

      return [];
    },

    async relatedPeople({ slug }, _, { notablePersonBySlugLoader }) {
      if (slug) {
        const notablePerson = await notablePersonBySlugLoader.load(slug);
        if (notablePerson) {
          return await notablePerson.relatedPeople;
        }
      }

      return [];
    },

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

    async editorialSummary({ slug }, _, { notablePersonBySlugLoader }) {
      if (slug) {
        const notablePerson = await notablePersonBySlugLoader.load(slug);
        if (notablePerson) {
          const editorialSummary = await notablePerson.editorialSummary;

          if (editorialSummary) {
            const nodesRepo = (await connection).getRepository(
              EditorialSummaryNode,
            );

            return {
              ...editorialSummary,
              nodes: (await nodesRepo.find({
                where: {
                  editorialSummaryId: editorialSummary.id,
                },
                order: {
                  order: 'ASC',
                },
                relations: ['parent'],
              })).map(n => ({
                ...n,
                parentId: n.parent ? n.parent.id : null,
              })),
            };
          }
        }
      }

      return null;
    },

    /** @deprecated */
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

    async mainPhoto({ slug }, _, { notablePersonBySlugLoader }) {
      if (slug) {
        const notablePerson = await notablePersonBySlugLoader.load(slug);

        if (notablePerson && notablePerson.mainPhoto) {
          const { colorPalette, ...rest } = notablePerson.mainPhoto;
          
          return {
            ...rest,
            colorPalette: await colorPalette,
          };
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
