import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';

import { NotablePerson } from '../entities/notablePerson';

import { notablePersonIndex } from '../../algolia';

@EventSubscriber()
class NotablePersonSubscriber
  implements EntitySubscriberInterface<NotablePerson> {
  listenTo() {
    return NotablePerson;
  }

  async afterInsert(event: InsertEvent<NotablePerson>) {
    return (await notablePersonIndex).addObject(event.entity, event.entity.id);
  }

  async afterRemove(event: RemoveEvent<NotablePerson>) {
    return (await notablePersonIndex).deleteObject(event.entityId);
  }

  async afterUpdate(event: UpdateEvent<NotablePerson>) {
    return (await notablePersonIndex).partialUpdateObject({
      ...event.entity,
      objectID: event.entity.id,
    });
  }
}

export const algoliaSubscribers = [NotablePersonSubscriber];
