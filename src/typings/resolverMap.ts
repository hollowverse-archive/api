import { TypesMap, DirectiveMap } from './schema';
import { SchemaContext } from './schemaContext';
import { GraphQLResolveInfo } from 'graphql/type';
import { NextResolverFn } from 'graphql-tools/dist/Interfaces';

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

type DirectiveResolver<Args, Context, Source = {}> = (
  next: NextResolverFn,
  source: Source,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo,
) => any;

type BuiltInDirectives = 'pick' | 'include' | 'deprecated';

type CustomDirectiveMap = {
  [K in Exclude<keyof DirectiveMap, BuiltInDirectives>]: DirectiveMap[K]
};

export type DirectiveResolverMap = {
  [T in keyof CustomDirectiveMap]: DirectiveResolver<
    DirectiveMap[T]['args'],
    SchemaContext
  >
};
