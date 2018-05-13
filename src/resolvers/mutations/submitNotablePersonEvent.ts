import { ResolverMap } from '../../typings/resolverMap';
import { NotablePerson } from '../../database/entities/NotablePerson';
import { makeErrorResult, makeSuccessResult } from '../../helpers/makeResult';

export const resolvers: Partial<ResolverMap> = {
  RootMutation: {
    async submitNotablePersonEvent(
      _,
      { input: { notablePersonId, type } },
      { connection },
    ) {
      if (type !== 'quote') {
        return {
          result: makeErrorResult(
            'NOT_IMPLEMENTED',
            'Only events of type "quote" can be submitted currently',
          ),
        };
      }

      const notablePeople = connection.getRepository(NotablePerson);

      const notablePerson = await notablePeople.findOne(notablePersonId);

      if (!notablePerson) {
        return {
          result: makeErrorResult(
            'BAD_REQUEST',
            'No notable person was found with the specified ID',
          ),
        };
      }

      return {
        result: makeSuccessResult(),
        id: 'f29763c1-37a9-4b3a-bae1-0ac433d8d14d',
      };
    },
  },
};
