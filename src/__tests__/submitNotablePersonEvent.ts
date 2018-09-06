import { TestContext, createTestContext } from '../helpers/testHelpers';
import gql from 'graphql-tag';
import { User } from '../database/entities/User';

describe('submit a notable person event', () => {
  let context: TestContext;
  let submitNotablePersonEventMutation: any;
  let getNotablePersonEventsQuery: any;

  beforeAll(async () => {
    context = await createTestContext();

    getNotablePersonEventsQuery = gql`
      query NotablePerson($slug: String!, $eventsQuery: EventsQueryInput!) {
        notablePerson(slug: $slug) {
          name
          events(query: $eventsQuery) {
            quote
            isQuoteByNotablePerson
          }
        }
      }
    `;

    submitNotablePersonEventMutation = gql`
      mutation SubmitNotablePersonEvent(
        $input: SubmitNotablePersonEventInput!
      ) {
        submitNotablePersonEvent(input: $input) {
          result {
            state
          }
        }
      }
    `;

    const createNotablePersonMutation = gql`
      mutation CreateNotablePerson($input: CreateNotablePersonInput!) {
        createNotablePerson(input: $input) {
          name
        }
      }
    `;

    const createUserMutation = gql`
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          name
          email
        }
      }
    `;

    context.authProvider.getProfileDetailsByToken = async () => {
      return {
        id: '123456',
        name: 'New User',
      };
    };

    await context.client.request(createUserMutation, {
      input: {
        fbAccessToken: '123456',
      },
    });

    context.authProvider.findUserByToken = async () => {
      const user = await context.connection
        .getRepository(User)
        .findOne({ where: { fbId: '123456' } });

      user!.role = 'EDITOR';

      return user;
    };

    context.client.setHeader('Authorization', 'Bearer 123456');

    await context.client.request(createNotablePersonMutation, {
      input: {
        slug: 'Tom_Hanks',
        name: 'Tom Hanks',
      },
    });
  });

  afterAll(async () => {
    if (context) {
      await context.teardown();
    }
  });

  it('authenticated users can submit events', async () => {
    context.client.setHeader('Authorization', 'Bearer 123');
    context.authProvider.findUserByToken = async () => {
      const user = await context.connection
        .getRepository(User)
        .findOne({ where: { fbId: '123456' } });

      user!.role = null;

      return user;
    };

    const result = await context.client.request(
      submitNotablePersonEventMutation,
      {
        input: {
          slug: 'Tom_Hanks',
          type: 'quote',
          quote: 'Lorem ipsum',
          sourceUrl: 'https://example.com',
          isQuoteByNotablePerson: true,
        },
      },
    );

    expect(result).toEqual({
      submitNotablePersonEvent: {
        result: {
          state: 'SUCCESS',
        },
      },
    });
  });

  it('non-authorized users cannot submit a notable person event', async () => {
    context.client.setHeader('Authorization', '');
    expect.hasAssertions();

    try {
      await context.client.request(submitNotablePersonEventMutation, {
        input: {
          slug: 'Tom_Hanks',
          type: 'quote',
          quote: 'Lorem ipsum',
          sourceUrl: 'https://example.com',
          isQuoteByNotablePerson: true,
        },
      });
    } catch (err) {
      expect(err.message).toMatch(/auth/i);
    }
  });

  it('newly submitted event can be viewed by all', async () => {
    context.client.setHeader('Authorization', '');

    const result = await context.client.request(getNotablePersonEventsQuery, {
      slug: 'Tom_Hanks',
      eventsQuery: {
        type: 'quote',
      },
    });

    expect(result).toEqual({
      notablePerson: {
        name: 'Tom Hanks',
        events: [
          {
            quote: 'Lorem ipsum',
            isQuoteByNotablePerson: true,
          },
        ],
      },
    });
  });
});
