import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date';
import { connection } from '../database/connection';
import { NotablePerson } from '../database/entities/notablePerson';

export const resolvers = {
  DateTime: GraphQLDateTime,

  DateOnly: GraphQLDate,

  RootQuery: {
    async notablePerson(_: any, { slug }: { slug: string }) {
      const db = await connection;
      const npRepository = db.getRepository(NotablePerson);

      return npRepository.findOne({
        where: {
          slug,
        },
        relations: ['events'],
      });
    },
  },
};
