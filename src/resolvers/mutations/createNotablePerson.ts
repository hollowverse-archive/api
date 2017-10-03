import { connection } from '../../database/connection';
import { NotablePerson } from '../../database/entities/notablePerson';
import {
  CreateNotablePersonRootMutationArgs,
  RootMutation,
} from '../../typings/schema';
import { SchemaContext } from '../../typings/schemaContext';

export async function createNotablePerson(
  _: undefined,
  { input: { name, slug } }: CreateNotablePersonRootMutationArgs,
  __: SchemaContext,
): Promise<RootMutation['createNotablePerson']> {
  const db = await connection;
  const notablePerson = new NotablePerson();

  notablePerson.name = name;
  notablePerson.slug = slug;

  const notablePeople = db.getRepository(NotablePerson);

  await notablePeople.save(notablePerson);

  return { name };
}
