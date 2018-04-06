import { NotablePerson } from '../../database/entities/NotablePerson';
import { ResolverMap } from '../../typings/resolverMap';

export const resolvers: Partial<ResolverMap> = {
  RootMutation: {
    async createNotablePerson(_, { input: { name, slug } }, { connection }) {
      const notablePerson = new NotablePerson();

      notablePerson.name = name;
      notablePerson.slug = slug;

      const notablePeople = connection.getRepository(NotablePerson);

      await notablePeople.save(notablePerson);

      return { name };
    },
  },
};
