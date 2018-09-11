import { ResolverMap } from '../../typings/resolverMap';
import { makeErrorResult, makeSuccessResult } from '../../helpers/makeResult';
import { NotablePersonEvent } from '../../database/entities/NotablePersonEvent';
import { ApiError } from '../../helpers/apiError';

export const resolvers: Partial<ResolverMap> = {
  RootMutation: {
    async submitNotablePersonEvent(
      _,
      {
        input: {
          slug,
          type,
          sourceUrl,
          quote = null,
          happenedOn,
          isQuoteByNotablePerson = null,
        },
      },
      { notablePersonBySlugLoader, connection, viewer },
    ) {
      if (type !== 'QUOTE') {
        return {
          result: makeErrorResult(
            'NOT_IMPLEMENTED',
            'Only events of type "quote" can be submitted currently',
          ),
        };
      }

      const notablePerson = await notablePersonBySlugLoader.load(slug);

      if (!notablePerson) {
        return {
          result: makeErrorResult(
            'BAD_REQUEST',
            'No notable person was found with the specified slug',
          ),
        };
      }

      if (!viewer) {
        // This is a server error. `viewer` should have been checked by `requireAuth`.
        throw new ApiError(
          'INTERNAL',
          'Expected `viewer` to be defined in `submitNotablePersonEvent`',
        );
      }

      const event = new NotablePersonEvent();

      event.sourceUrl = sourceUrl;
      event.type = type;
      event.quote = quote;
      event.isQuoteByNotablePerson = isQuoteByNotablePerson;
      event.notablePerson = notablePerson;
      event.submittedBy = viewer;
      event.happenedOn = happenedOn || null;
      event.postedAt = new Date();

      await connection.getRepository(NotablePersonEvent).save(event);

      return {
        result: makeSuccessResult(),
      };
    },
  },
};
