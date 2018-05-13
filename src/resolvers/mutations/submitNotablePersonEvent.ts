import { ResolverMap } from '../../typings/resolverMap';
import { NotablePerson } from '../../database/entities/NotablePerson';

export const resolvers: Partial<ResolverMap> = {
  RootMutation: {
    async submitNotablePersonEvent(
      _,
      { input: { notablePersonId, type } },
      { connection },
    ) {
      if (type !== 'quote') {
        return {
          result: {
            state: 'error',
            errors: [
              {
                code: 'NOT_IMPLEMENTED',
                message:
                  'Only events of type "quote" can be submitted currently',
              },
            ],
          },
        };
      }

      const notablePeople = connection.getRepository(NotablePerson);

      const notablePerson = await notablePeople.findOneById(notablePersonId);

      if (!notablePerson) {
        return {
          result: {
            state: 'error',
            errors: [
              {
                code: 'BAD_REQUEST',
                message: 'No notable person was found with the specified ID',
              },
            ],
          },
        };
      }

      return {
        result: {
          state: 'success',
        },
        id: 'f29763c1-37a9-4b3a-bae1-0ac433d8d14d',
      };
    },
  },
};
