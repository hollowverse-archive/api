// tslint:disable no-multiline-string no-implicit-dependencies
import { TestContext, createTestContext } from '../helpers/testHelpers';
import gql from 'graphql-tag';

describe('it works', () => {
  let context: TestContext;

  beforeEach(async () => {
    context = await createTestContext();
  });

  it('should work', async () => {
    const query = gql`
      query NotablePerson($slug: String!) {
        notablePerson(slug: $slug) {
          name
        }
      }
    `;

    const result = await context.makeRequest(query, { slug: 'Tom_Hanks' });
    expect(result).toEqual({
      notablePerson: {
        name: 'Tom Hanks',
      },
    });
  });
});
