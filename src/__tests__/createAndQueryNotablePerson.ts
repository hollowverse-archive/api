// tslint:disable no-multiline-string no-implicit-dependencies no-floating-promises
import {
  TestContext,
  createTestContext,
  FakeAuthProvider,
} from '../helpers/testHelpers';
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
  const createNotablePersonQuery = gql`
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
    const result = context.client.request(createNotablePersonQuery, {
      input: {
        slug: 'Tom_Hanks',
        name: 'Tom Hanks',
      },
    });

    expect(result).rejects.toBeDefined();
  });

  it('users with required role can create a new notable person', async () => {
    context = await createTestContext({
      graphqlClientOptions: {
        headers: {
          Authorization: 'Bearer 123',
        },
      },
      createApiRouterOptions: {
        connection: context.connection,
        authProvider: new class extends FakeAuthProvider {
          findUserByToken = async () => {
            const user = new User();
            user.name = 'Editor';
            user.email = 'editor@hollowverse.com';
            user.role = 'EDITOR';

            return user;
          };
        }(),
      },
    });

    const result = await context.client.request(createNotablePersonQuery, {
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

  it('newly created notable person can be viewed by all', async () => {
    context = await createTestContext({
      createApiRouterOptions: {
        connection: context.connection,
      },
    });

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
