// tslint:disable no-console
// tslint:disable:no-non-null-assertion

import { GraphQLClient } from 'graphql-request';

import {
  algoliaClient as _algoliaClient,
  getIndexName,
} from '../algoliaClient';

// tslint:disable-next-line:no-http-string
const API_ENDPOINT = 'http://localhost:8080/graphql';

async function main() {
  const algoliaClient = await _algoliaClient;
  const apiClient = new GraphQLClient(API_ENDPOINT);

  const tempIndexName = getIndexName('NotablePerson.temp');
  const finalIndexName = getIndexName('NotablePerson');

  const tempIndex = algoliaClient.initIndex(tempIndexName);

  const data: any = await apiClient.request(
    // tslint:disable-next-line:no-multiline-string
    `
      query NotablePeople($first: Int!) {
        notablePeople(first: $first) {
          edges {
            node {
              slug
              name
              mainPhoto {
                url
              }
              labels {
                text
              }
              summary
              editorialSummary {
                author
              }
            }
          }
        }
      }
    `,
    {
      first: 2000,
    },
  );

  const allPeople = data!.notablePeople.edges.map((e: any) => ({
    ...e.node,
    objectID: e.node.slug,
  }));

  console.log(allPeople.length);

  await tempIndex.saveObjects(
    allPeople
      .filter((p: any) => p.editorialSummary !== null)
      .map((person: any) => {
        return {
          ...person,
          labels: person.labels.map((label: any) => label.text),
        };
      }),
  );

  await algoliaClient.moveIndex(tempIndexName, finalIndexName);
}

main()
  .then(() => {
    console.info('Algolia index updated');
    process.exit(0);
  })
  .catch(e => {
    console.error('Failed to update Algolia index', e);
    process.exit(1);
  });
