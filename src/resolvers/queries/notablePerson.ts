import { connection } from '../../database/connection';
import { NotablePerson } from '../../database/entities/notablePerson';
import { Event } from '../../database/entities/event';
import { NotablePersonRootQueryArgs } from '../../typings/schema';

async function notablePerson(
  _: undefined,
  { slug }: NotablePersonRootQueryArgs,
) {
  const db = await connection;
  const npRepository = db.getRepository(NotablePerson);

  return npRepository.findOne({
    where: {
      slug,
    },
  });
}

export default {
  RootQuery: {
    notablePerson,
  },

  NotablePerson: {
    async events(np: NotablePerson) {
      const db = await connection;

      const repo = db.getRepository(Event);

      return repo.find({
        where: { notablePersonId: np.id },
        relations: ['notablePerson'],
      });
    },
  },
};
