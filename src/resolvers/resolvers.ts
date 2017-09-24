export default {
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
            happenedOn: new Date(),
          },
        ],
      };
    },
  },
};
