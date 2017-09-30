import { connection } from '../../database/connection';
import { NotablePerson } from '../../database/entities/notablePerson';
import {
  CreateNotablePersonRootMutationArgs,
  RootMutation,
} from '../../typings/schema';
import { SchemaContext } from '../../typings/schemaContext';

/**
 * Create a new user passing using a valid Facebook access token
 * issued for the Hollowverse application.
 * 
 * The name and email of the new user will be obtained from Facebook if
 * not specified in the mutation input.
 */
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

  await notablePeople.persist(notablePerson);

  return { name };
}
