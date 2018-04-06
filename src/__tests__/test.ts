// tslint:disable no-multiline-string no-implicit-dependencies
import { TestContext, createTestContext } from '../helpers/testHelpers';
import gql from 'graphql-tag';
describe('it works', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await createTestContext();
  });

  afterAll(async () => {
    if (context) {
      await context.teardown();
    }
  });

  it('should work', async () => {
    const getNotablePersonQuery = gql`
      query GetNotablePerson($slug: String!) {
        notablePerson(slug: $slug) {
          name
        }
      }
    `;

    const result = await context.client.request(getNotablePersonQuery, {
      slug: 'Tom_Hanks',
    });

    expect(result).toEqual({
      notablePerson: null,
    });
  });
});
