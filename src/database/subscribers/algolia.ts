import * as algoliaSearch from 'algoliasearch';
import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';

import { NotablePerson } from '../entities/notablePerson';

const applicationId = '';
const apiKey = '';

const algoliaClient = algoliaSearch(applicationId, apiKey);
const index = algoliaClient.initIndex('notable-people');

@EventSubscriber()
class NotablePersonSubscriber
  implements EntitySubscriberInterface<NotablePerson> {
  listenTo() {
    return NotablePerson;
  }

  async afterInsert(event: InsertEvent<NotablePerson>) {
    await index.addObject(event.entity, event.entity.id);
  }

  async afterRemove(event: RemoveEvent<NotablePerson>) {
    await index.deleteObject(event.entityId);
  }

  async afterUpdate(event: UpdateEvent<NotablePerson>) {
    await index.partialUpdateObject({
      ...event.entity,
      objectID: event.entity.id,
    });
  }
}

export const algoliaSubscribers = [NotablePersonSubscriber];
