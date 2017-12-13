import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';

import { pick } from 'lodash';

import { NotablePerson } from '../entities/NotablePerson';

import { notablePersonIndex } from '../../algoliaClient';

const indexedNotablePersonKeys: Array<keyof NotablePerson> = [
  'name',
  'summary',
  'labels',
];

/**
 * Listens to changes in the notable people table and related tables
 * and updates the corresponding Algolia index.
 */
@EventSubscriber()
class NotablePersonSubscriber
  implements EntitySubscriberInterface<NotablePerson> {
  listenTo() {
    return NotablePerson;
  }

  async afterInsert(event: InsertEvent<NotablePerson>) {
    return (await notablePersonIndex).addObject({
      ...pick(event.entity, indexedNotablePersonKeys),
      labels: event.entity.labels.map(label => label.text),
      objectID: event.entity.id,
    });
  }

  async afterRemove(event: RemoveEvent<NotablePerson>) {
    return (await notablePersonIndex).deleteObject(event.entityId);
  }

  async afterUpdate(event: UpdateEvent<NotablePerson>) {
    return (await notablePersonIndex).partialUpdateObject({
      ...pick(event.entity, indexedNotablePersonKeys),
      labels: event.entity.labels.map(label => label.text),
      objectID: event.entity.id,
    });
  }
}

export const algoliaSubscribers = [NotablePersonSubscriber];
