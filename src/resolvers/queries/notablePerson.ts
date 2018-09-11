import { NotablePersonEvent } from '../../database/entities/NotablePersonEvent';
import { NotablePersonEventComment } from '../../database/entities/NotablePersonEventComment';
import { EditorialSummaryNode } from '../../database/entities/EditorialSummaryNode';
import { ResolverMap } from '../../typings/resolverMap';
import { URL } from 'url';
import { ApiError } from '../../helpers/apiError';

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
          return notablePerson.labels;
        }
      }

      return [];
    },

    async relatedPeople({ slug }, _, { notablePersonBySlugLoader }) {
      if (slug) {
        const notablePerson = await notablePersonBySlugLoader.load(slug);
        if (notablePerson) {
          return notablePerson.relatedPeople as Promise<any[]>;
        }
      }

      return [];
    },

    async events({ slug }, args, { notablePersonBySlugLoader, connection }) {
      if (slug) {
        const notablePerson = await notablePersonBySlugLoader.load(slug);
        if (notablePerson) {
          const events = connection.getRepository(NotablePersonEvent);

          return events.find({
            where: {
              ...args.query,
              notablePersonId: notablePerson.id,
            },
            order: {
              postedAt: 'DESC',
            },
            relations: ['labels'],
          }) as Promise<any[]>;
        }
      }

      return [];
    },

    async editorialSummary(
      { slug },
      _,
      { connection, notablePersonBySlugLoader },
    ) {
      if (slug) {
        const notablePerson = await notablePersonBySlugLoader.load(slug);
        if (notablePerson) {
          const editorialSummary = await notablePerson.editorialSummary;

          if (editorialSummary) {
            const nodesRepo = connection.getRepository(EditorialSummaryNode);

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
              'https://photos.hollowverse.com',
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
          return notablePerson.mainPhoto;
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
          }

          return new URL(`${slug}`, 'https://hollowverse.com').toString();
        }
      }

      throw new TypeError();
    },
  },
  NotablePersonEvent: {
    async comments(event, _, { connection }) {
      const repo = connection.getRepository(NotablePersonEventComment);

      return repo.find({
        where: {
          eventId: event.id,
        },
        relations: ['owner'],
      });
    },

    async submittedBy(event, _, { connection }) {
      const repo = connection.getRepository(NotablePersonEvent);

      const result = await repo.findOne({
        where: {
          id: event.id,
        },
        relations: ['submittedBy'],
      });

      if (!result) {
        throw new ApiError('INTERNAL', 'Expected event to be defined');
      }

      return result.submittedBy as any;
    },

    async notablePerson(event, _, { connection }) {
      const repo = connection.getRepository(NotablePersonEvent);

      const result = await repo.findOne({
        where: {
          id: event.id,
        },
        relations: ['notablePerson'],
      });

      if (!result) {
        throw new ApiError('INTERNAL', 'Expected event to be defined');
      }

      return result.notablePerson as any;
    },
  },
};
