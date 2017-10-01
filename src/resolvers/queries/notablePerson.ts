import { connection } from '../../database/connection';
import { NotablePerson } from '../../database/entities/notablePerson';
import { NotablePersonEvent } from '../../database/entities/event';
import { NotablePersonRootQueryArgs } from '../../typings/schema';
import { URL } from 'url';

export default {
  RootQuery: {
    async notablePerson(_: undefined, { slug }: NotablePersonRootQueryArgs) {
      const db = await connection;
      const npRepository = db.getRepository(NotablePerson);

      return npRepository.findOne({
        where: {
          slug,
        },
        relations: ['labels'],
      });
    },
  },

  NotablePerson: {
    photoUrl(np: NotablePerson) {
      return new URL(
        np.photoId,
        'https://files.hollowverse.com/notable-people',
      );
    },

    async events(np: NotablePerson) {
      const db = await connection;

      const repo = db.getRepository(NotablePersonEvent);

      return repo.find({
        where: {
          notablePersonId: np.id,
        },
        take: 2,
        order: {
          postedAt: 'DESC',
        },
      });
    },
  },
};
