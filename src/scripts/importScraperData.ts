// tslint:disable no-console no-non-null-assertion max-func-body-length

import * as uuid from 'uuid/v4';
import * as path from 'path';
import * as bluebird from 'bluebird';
import { compact } from 'lodash';
import { connection } from '../database/connection';
import { NotablePerson } from '../database/entities/notablePerson';
import { EditorialSummaryNode } from '../database/entities/editorialSummaryNode';
import { NotablePersonLabel } from '../database/entities/notablePersonLabel';
import { readJson } from '../helpers/readFile';
import {
  Result,
  isPiece,
  isResultWithContent,
} from '../scraper/src/lib/scrape';
import { glob } from '../scraper/src/lib/helpers';

type ScraperResult = Result & {
  wikipediaData?: {
    url: string;
    title: string;
    thumbnail?: {
      source: string;
      width: number;
      height: number;
    };
    isDisambiguation: boolean;
  };
};

connection
  .then(async db =>
    db.transaction(async entityManager => {
      const notablePeople = entityManager.getRepository(NotablePerson);
      const labels = entityManager.getRepository(NotablePersonLabel);
      const editorialSummaryNodes = entityManager.getRepository(
        EditorialSummaryNode,
      );
      const files = await glob('src/scraper/output/scraperResults/*.json');

      return bluebird.map(files, async file => {
        const json = await readJson<ScraperResult>(file);

        if (json.wikipediaData === undefined) {
          throw new TypeError('Expected object to have wikipedia data.');
        }

        const slug = json.wikipediaData.url.replace(
          'https://en.wikipedia.org/wiki/',
          '',
        );
        const oldSlug = path.basename(file).replace('.json', '');

        let notablePerson = await notablePeople.findOne({ where: { slug } });
        if (!notablePerson) {
          notablePerson = new NotablePerson();
          notablePerson.id = uuid();
          notablePerson.slug = slug;
          notablePerson.oldSlug = oldSlug;

          if (isResultWithContent(json)) {
            const { religion, politicalViews } = json;

            const summary: string[] = compact([religion, politicalViews]);

            notablePerson.summary =
              summary.length > 0 ? summary.join('\n') : null;

            notablePerson.labels = await Promise.all(
              json.tags.map(async tag => {
                const newText = tag;
                let label = await labels.findOne({ where: { text: newText } });
                if (!label) {
                  label = new NotablePersonLabel();
                  label.text = newText;
                  label.id = uuid();
                  label.createdAt = new Date();
                }

                return labels.save(label);
              }),
            );

            notablePerson.editorialSummaryAuthor = json.author;

            notablePerson.editorialSummaryNodes = await editorialSummaryNodes.save(
              json.content.map((_node, order) => {
                const node = new EditorialSummaryNode();
                node.type = _node.type;
                node.id = uuid();
                node.order = order;
                if (isPiece(_node)) {
                  const { sourceTitle, sourceUrl, text } = _node;
                  node.sourceTitle = sourceTitle || null;
                  node.sourceUrl = sourceUrl || null;
                  node.text = text || null;
                }

                return node;
              }),
            );
          }
        }
      });
    }),
  )
  .then(() => {
    console.info('Scraper data imported successfully');
    process.exit(0);
  })
  .catch(e => {
    console.error('Error importing data:', e.message || e);
    process.exit(1);
  });
