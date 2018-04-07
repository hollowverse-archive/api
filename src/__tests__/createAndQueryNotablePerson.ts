import { TestContext, createTestContext } from '../helpers/testHelpers';
import gql from 'graphql-tag';
import { User } from '../database/entities/User';

describe('Create and query a notable person by slug', () => {
  let context: TestContext;
  // tslint:disable-next-line:mocha-no-side-effect-code
  const getNotablePersonQuery = gql`
    query GetNotablePerson($slug: String!) {
      notablePerson(slug: $slug) {
        name
      }
    }
  `;

  // tslint:disable-next-line:mocha-no-side-effect-code
  const createNotablePersonMutation = gql`
    mutation CreateNotablePerson($input: CreateNotablePersonInput!) {
      createNotablePerson(input: $input) {
        name
      }
    }
  `;

  beforeAll(async () => {
    context = await createTestContext();
  });

  afterAll(async () => {
    if (context) {
      await context.teardown();
    }
  });

  it('when not found, returns null', async () => {
    const result = await context.client.request(getNotablePersonQuery, {
      slug: 'Tom_Hanks',
    });

    expect(result).toEqual({
      notablePerson: null,
    });
  });

  it('non-authorized users cannot create a new notable person', async () => {
    try {
      await context.client.request(createNotablePersonMutation, {
        input: {
          slug: 'Tom_Hanks',
          name: 'Tom Hanks',
        },
      });
    } catch (err) {
      expect(err.message).toMatch(/auth/i);
    }
  });

  it('users with required role can create a new notable person', async () => {
    context.client.setHeader('Authorization', 'Bearer 123');
    context.authProvider.findUserByToken = async () => {
      const user = new User();
      user.name = 'Editor';
      user.email = 'editor@hollowverse.com';
      user.role = 'EDITOR';

      return user;
    };

    const result = await context.client.request(createNotablePersonMutation, {
      input: {
        slug: 'Tom_Hanks',
        name: 'Tom Hanks',
      },
    });

    expect(result).toEqual({
      createNotablePerson: {
        name: 'Tom Hanks',
      },
    });
  });

  it('users with some other role cannot create a new notable person', async () => {
    expect.hasAssertions();

    context.client.setHeader('Authorization', 'Bearer 123456');
    context.authProvider.findUserByToken = async () => {
      const user = new User();
      user.name = 'Moderator';
      user.role = 'MODERATOR';

      return user;
    };

    try {
      await context.client.request(createNotablePersonMutation, {
        input: {
          slug: 'Tom_Hanks',
          name: 'Tom Hanks',
        },
      });
    } catch (error) {
      expect(error.message).toMatch(/role/i);
    }
  });

  it('newly created notable person can be viewed by all', async () => {
    context.client.setHeader('Authorization', '');

    const result = await context.client.request(getNotablePersonQuery, {
      slug: 'Tom_Hanks',
    });

    expect(result).toEqual({
      notablePerson: {
        name: 'Tom Hanks',
      },
    });
  });
});
