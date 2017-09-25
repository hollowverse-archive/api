import { connection } from '../../database/connection';
import { NotablePerson } from '../../database/entities/notablePerson';
import { NotablePersonRootQueryArgs } from '../../typings/schema';

export async function notablePerson(
  _: undefined,
  { slug }: NotablePersonRootQueryArgs,
) {
  const db = await connection;
  const npRepository = db.getRepository(NotablePerson);

  return npRepository.findOne({
    where: {
      slug,
    },
    relations: ['events'],
  });
}
