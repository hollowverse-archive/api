import { connection } from '../../database/connection';
import { NotablePerson } from '../../database/entities/notablePerson';
import { NotablePersonEvent } from '../../database/entities/event';
import { NotablePersonEventComment } from '../../database/entities/comment';
import { EditorialSummaryNode } from '../../database/entities/editorialSummaryNode';
import {
  NotablePersonRootQueryArgs,
  EventsNotablePersonArgs,
  NotablePerson as NotablePersonType,
  RootQuery,
} from '../../typings/schema';
import { SchemaContext } from '../../typings/schemaContext';

type Result<T> = Promise<T> | T;

type DeepPartial<T> = { [K in keyof T]: DeepPartial<T[K]> };

type TypeResolver<Type, Context> = Partial<
  {
    [K in keyof Type]: (
      type: Partial<Type>,
      args: Record<string, any>,
      context: Context,
    ) => Result<DeepPartial<Type[K]>>
  }
>;

const NotablePersonResolvers: TypeResolver<NotablePersonType, SchemaContext> = {
  async events(notablePerson, args: EventsNotablePersonArgs) {
    const db = await connection;

    const repo = db.getRepository(NotablePersonEvent);

    return repo.find({
      where: {
        ...args.query,
        notablePersonId: notablePerson.id!,
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
      const nodesRepo = (await connection).getRepository(EditorialSummaryNode);

      return {
        ...editorialSummary,
        asd: 1,
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
};

const RootQueryResolvers: TypeResolver<RootQuery, SchemaContext> = {
  async notablePerson(_, { slug }: NotablePersonRootQueryArgs) {
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
};

export const notablePersonResolvers = {
  RootQuery: RootQueryResolvers,

  NotablePerson: NotablePersonResolvers,

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
