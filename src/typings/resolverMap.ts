import { SchemaContext } from './schemaContext';
import { GraphQLResolveInfo } from 'graphql/type';

import { TypesMap } from '../../types';

type Result<T> = Promise<T> | T;

type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> };

export type GeneratedType<T> = {
  returnType: T;
  argsByField: { [K in keyof T]: Record<string, any> };
};

export type FnResolver<ReturnType, Source, Args, Context> = (
  _: Source,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo,
) => Result<DeepPartial<ReturnType> | undefined | null>;

export type TypeResolver<Type extends GeneratedType<any>, Context> =
  | Partial<
      {
        [K in keyof Type['returnType']]: (
          type: Partial<Type['returnType']>,
          args: Type['argsByField'][K],
          context: Context,
          info: GraphQLResolveInfo,
        ) => Result<DeepPartial<Type['returnType'][K]>>
      }
    >
  | (FnResolver<Type['returnType'], undefined, undefined, Context>);

export type ResolverMap = {
  [T in keyof TypesMap]: TypeResolver<TypesMap[T], SchemaContext>
};
