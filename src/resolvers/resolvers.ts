import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date';

export const resolvers = {
  DateTime: GraphQLDateTime,

  DateOnly: GraphQLDate,

  RootQuery: {
    notablePerson() {
      return {
        slug: 'Tom_Hanks',
        name: 'Tom Hanks',
        events: [
          {
            id: 1,
            text: 'Lorem ipsum dolor sit amet',
            isQuoteByNotablePerson: true,
            sourceUrl: 'https://example.com/',
            addedAt: new Date(),
            happenedOn: '2010-10-10',
          },
        ],
      };
    },
  },
};
