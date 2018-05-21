import { ResolverMap } from '../../typings/resolverMap';
import { makeErrorResult, makeSuccessResult } from '../../helpers/makeResult';
import { NotablePersonEvent } from '../../database/entities/NotablePersonEvent';

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
          isQuoteByNotablePerson = null,
        },
      },
      { notablePersonBySlugLoader, connection, viewer },
    ) {
      if (type !== 'quote') {
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

      const event = new NotablePersonEvent();

      event.sourceUrl = sourceUrl;
      event.type = type;
      event.quote = quote;
      event.isQuoteByNotablePerson = isQuoteByNotablePerson;
      event.notablePerson = notablePerson;
      event.owner = viewer!;

      await connection.getRepository(NotablePersonEvent).save(event);

      return {
        result: makeSuccessResult(),
        id: 'f29763c1-37a9-4b3a-bae1-0ac433d8d14d',
      };
    },
  },
};
