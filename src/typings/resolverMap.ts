import { SchemaContext } from './schemaContext';

import {
  RootQuery,
  RootMutation,
  NotablePersonEventType,
  User,
  Viewer,
  EditorialSummary,
  EditorialSummaryNode,
  NotablePerson,
} from './schema';

type Result<T> = Promise<T> | T;

type DeepPartial<T> = { [K in keyof T]: DeepPartial<T[K]> };

type TypeResolver<Type, Context> =
  | Partial<
      {
        [K in keyof Type]: (
          type: Partial<Type>,
          args: Record<string, any>,
          context: Context,
        ) => Result<DeepPartial<Type[K]>>
      }
    >
  | ((
      _: undefined,
      args: Record<string, any>,
      context: Context,
    ) => Result<Type | undefined | null>);

type Types = {
  RootQuery: RootQuery;
  RootMutation: RootMutation;
  NotablePersonEventType: NotablePersonEventType;
  User: User;
  Viewer: Viewer;
  EditorialSummary: EditorialSummary;
  EditorialSummaryNode: EditorialSummaryNode;
  NotablePerson: NotablePerson;
};

export type ResolverMap = {
  [T in keyof Types]: TypeResolver<Types[T], SchemaContext>
};
