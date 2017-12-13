import { connection } from '../../database/connection';
import { NotablePerson } from '../../database/entities/NotablePerson';
import { NotablePersonEvent } from '../../database/entities/NotablePersonEvent';
import { NotablePersonEventComment } from '../../database/entities/NotablePersonEventComment';
import { EditorialSummaryNode } from '../../database/entities/EditorialSummaryNode';
import {
  NotablePersonRootQueryArgs,
  EventsNotablePersonArgs,
  NotablePerson as NotablePersonType,
} from '../../typings/schema';
import { URL } from 'url';

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

    photoUrl(notablePerson: NotablePerson): NotablePersonType['photoUrl'] {
      return notablePerson.photoId
        ? new URL(
            `notable-people/${notablePerson.photoId}`,
            'https://files.hollowverse.com',
          ).toString()
        : null;
    },

    commentsUrl(
      notablePerson: NotablePerson,
    ): NotablePersonType['commentsUrl'] {
      let url: URL;

      if (notablePerson.oldSlug !== null) {
        url = new URL(
          `${notablePerson.oldSlug}/`,
          // tslint:disable-next-line:no-http-string
          'http://hollowverse.com',
        );
      } else {
        url = new URL(`${notablePerson.slug}`, 'https://hollowverse.com');
      }

      return url.toString();
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
