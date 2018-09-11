import { NotablePersonEvent } from '../../database/entities/NotablePersonEvent';
import { ApiError } from '../../helpers/apiError';
import { makeErrorResult, makeSuccessResult } from '../../helpers/makeResult';
import { ResolverMap } from '../../typings/resolverMap';

export const resolvers: Partial<ResolverMap> = {
  RootMutation: {
    async changeNotablePersonEventReviewStatus(
      _,
      { input: { eventId, newValue } },
      { connection, viewer },
    ) {
      if (!viewer) {
        // This is a server error. `viewer` should have been checked by `requireOneOfRoles`.
        throw new ApiError('INTERNAL', 'Expected `viewer` to be defined`');
      }

      const events = connection.getRepository(NotablePersonEvent);

      const event = await events.findOneById(eventId);

      if (!event) {
        return {
          result: makeErrorResult(
            'BAD_REQUEST',
            'Could not find event with the specified ID',
          ),
        };
      }

      if (event.reviewStatus === newValue) {
        return {
          result: makeErrorResult(
            'BAD_REQUEST',
            'The new value is the same as the old one',
          ),
        };
      }

      event.reviewStatus = newValue;

      await events.save(event);

      return {
        result: makeSuccessResult(),
      };
    },
  },
};
