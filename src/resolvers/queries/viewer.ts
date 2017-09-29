import { SchemaContext } from '../../typings/schemaContext';

export async function viewer(_: undefined, __: any, context: SchemaContext) {
  return context.viewer;
}
