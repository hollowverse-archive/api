import { connection } from '../../database/connection';
import { NotablePerson } from '../../database/entities/NotablePerson';
import { ResolverMap } from '../../typings/resolverMap';
import { requireAuthentication } from '../../helpers/requireAuthentication';

// @ts-ignore
export const resolvers: Partial<ResolverMap> = {
  RootMutation: {
    createNotablePerson: requireAuthentication(
      async (_, { input: { name, slug } }) => {
        const db = await connection;
        const notablePerson = new NotablePerson();

        notablePerson.name = name;
        notablePerson.slug = slug;

        const notablePeople = db.getRepository(NotablePerson);

        await notablePeople.save(notablePerson);

        return { name };
      },
    ),
  },
};
