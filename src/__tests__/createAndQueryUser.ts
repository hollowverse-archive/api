import {
  TestContext,
  createTestContext,
  FakeAuthProvider,
} from '../helpers/testHelpers';
import gql from 'graphql-tag';
import { User } from '../database/entities/User';

describe('Create and query new user', () => {
  let context: TestContext;
  // tslint:disable-next-line:mocha-no-side-effect-code
  const viewerQuery = gql`
    query CurrentGetUser {
      viewer {
        name
        email
      }
    }
  `;

  // tslint:disable-next-line:mocha-no-side-effect-code
  const createUserMutation = gql`
    mutation CreateUser($input: CreateUserInput!) {
      createUser(input: $input) {
        name
        email
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

  it('`viewer` inaccessible for unauthenticated users', async () => {
    try {
      await context.client.request(viewerQuery);
    } catch (error) {
      expect(error.message).toMatch(/auth/i);
    }
  });

  it('visitors can create a new user with just', async () => {
    context = await createTestContext({
      createApiRouterOptions: {
        connection: context.connection,
        authProvider: new class extends FakeAuthProvider {
          getProfileDetailsByToken = async () => {
            return {
              id: '123456',
              name: 'New User',
            };
          };
        }(),
      },
    });

    const result = await context.client.request(createUserMutation, {
      input: {
        fbAccessToken: '123456',
      },
    });

    expect(result).toEqual({
      createUser: {
        name: 'New User',
        email: null,
      },
    });
  });

  it('authenticated users can view their account details', async () => {
    context = await createTestContext({
      createApiRouterOptions: {
        connection: context.connection,
        authProvider: new class extends FakeAuthProvider {
          findUserByToken = jest.fn(async (token: string) => {
            // tslint:disable-next-line:possible-timing-attack
            if (token === '123456') {
              const user = new User();
              user.name = 'New User';

              return user;
            }

            return undefined;
          });
        }(),
      },
      graphqlClientOptions: {
        headers: {
          Authorization: 'Bearer 123456',
        },
      },
    });

    const result = await context.client.request(viewerQuery);

    expect(result).toEqual({
      viewer: {
        email: null,
        name: 'New User',
      },
    });

    expect(context.authProvider.findUserByToken).toHaveBeenCalledWith('123456');
  });

  it('users cannot access viewer info with invalid authentication details', async () => {
    expect.hasAssertions();

    context = await createTestContext({
      createApiRouterOptions: {
        connection: context.connection,
        authProvider: context.authProvider,
      },
      graphqlClientOptions: {
        headers: {
          Authorization: 'Bearer 000000',
        },
      },
    });

    try {
      await context.client.request(viewerQuery);
    } catch (error) {
      expect(error.message).toMatch(/auth/i);
    }
  });
});
