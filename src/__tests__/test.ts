// tslint:disable no-multiline-string no-implicit-dependencies
import { TestContext, createTestContext } from '../helpers/testHelpers';
import gql from 'graphql-tag';
describe('it works', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await createTestContext();
  }, 10000);

  afterAll(async () => {
    if (context) {
      await context.teardown();
    }
  }, 5000);

  it('should work', async () => {
    const query = gql`
      query GetNotablePerson($slug: String!) {
        notablePerson(slug: $slug) {
          name
        }
      }
    `;

    const result = await context.client.request(query, { slug: 'Tom_Hanks' });
    expect(result).toEqual({
      notablePerson: null,
    });
  });
});
