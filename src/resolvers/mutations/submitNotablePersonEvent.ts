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
          wasSuccessful: false,
          errors: [
            {
              code: 'NOT_IMPLEMENTED',
              message: 'Only events of type "quote" can be submitted currently',
            },
          ],
        };
      }

      const notablePeople = connection.getRepository(NotablePerson);

      const notablePerson = await notablePeople.findOneById(notablePersonId);

      if (!notablePerson) {
        return {
          wasSuccessful: false,
          errors: [
            {
              code: 'BAD_REQUEST',
              message: 'No notable person was found with the specified ID',
            },
          ],
        };
      }

      return {
        wasSuccessful: true,
      };
    },
  },
};
