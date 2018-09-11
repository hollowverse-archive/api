import gql from 'graphql-tag';
import { User } from '../database/entities/User';
import { createTestContext, TestContext } from '../helpers/testHelpers';

describe('create and query new user', () => {
  let context: TestContext;
  let viewerQuery: any;
  let createUserMutation: any;

  beforeAll(async () => {
    context = await createTestContext();

    viewerQuery = gql`
      query CurrentGetUser {
        viewer {
          name
          email
        }
      }
    `;

    createUserMutation = gql`
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          name
          email
        }
      }
    `;
  });

  afterAll(async () => {
    if (context) {
      await context.teardown();
    }
  });

  it('`viewer` is `null` for unauthenticated users', async () => {
    expect.hasAssertions();

    const result = (await context.client.request(viewerQuery)) as any;

    expect(result.viewer).toBeNull();
  });

  it('visitors can create a new user', async () => {
    context.authProvider.getProfileDetailsByToken = async () => {
      return {
        id: '123456',
        name: 'New User',
      };
    };

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
    context.client.setHeader('Authorization', 'Bearer 123456');
    context.authProvider.findUserByToken = jest.fn(async (token: string) => {
      // tslint:disable-next-line:possible-timing-attack
      if (token === '123456') {
        const user = new User();
        user.name = 'New User';

        return user;
      }

      return undefined;
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

    context.client.setHeader('Authorization', 'Bearer 000000');

    const result = (await context.client.request(viewerQuery)) as any;

    expect(result.viewer).toBeNull();
  });
});
