import { NextResolverFn } from 'graphql-tools/dist/Interfaces';
import { GraphQLResolveInfo } from 'graphql/type';
import { DirectiveMap, InterfaceMap, TypesMap } from './schema';
import { SchemaContext } from './schemaContext';

type Result<T> = Promise<T> | T;

type NonPartialable =
  | (() => any)
  | null
  | undefined
  | void
  | never
  | symbol
  | string
  | number;

type DeepPartialArray<T> = Array<Partial<T>>;

/* eslint-disable no-use-before-define */
export type DeepPartialResult<T> = T extends Array<infer R>
  ? Result<DeepPartialArray<R>>
  : T extends NonPartialable
    ? Result<T>
    : {
        [P in keyof T]?: T[P] extends NonPartialable
          ? Result<T[P]>
          : Result<DeepPartialResult<T[P]>>
      };
/* eslint-enable no-use-before-define */

export type GeneratedType<T> = {
  returnType: T;
  argsByField: { [K in keyof T]: Record<string, any> };
};

export type FnResolver<ReturnType, Source, Args, Context> = (
  _: Source,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo,
) => Result<DeepPartialResult<ReturnType> | undefined | null>;

export type TypeResolver<Type extends GeneratedType<any>, Context> =
  | Partial<
      {
        [K in keyof Type['returnType']]: (
          type: Partial<Type['returnType']>,
          args: Type['argsByField'][K],
          context: Context,
          info: GraphQLResolveInfo,
        ) => Result<DeepPartialResult<Type['returnType'][K]>>
      }
    >
  | (FnResolver<Type['returnType'], undefined, undefined, Context>);

export type ResolverMap = {
  [TypeName in keyof TypesMap]: TypeResolver<TypesMap[TypeName], SchemaContext>
};

type DirectiveResolver<Args, Context, Source = {}> = (
  next: NextResolverFn,
  source: Source,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo,
) => any;

/**
 * A union resolver tells GraphQL which one of the types of this union you are returning.
 *
 * > When you have a field in your schema that returns a union or interface type,
 * > you will need to specify an extra `__resolveType` field in your resolver map, which tells
 * > the GraphQL executor which type the result is, out of the available options.
 * @see https://www.apollographql.com/docs/graphql-tools/resolvers.html#Unions-and-interfaces
 */
type UnionOrInterfaceResolver<UnionOrInterface, PossibleTypeName, Context> = (
  object: UnionOrInterface,
  context: Context,
  info: GraphQLResolveInfo,
) => PossibleTypeName;

type BuiltInDirectives = 'pick' | 'include' | 'deprecated';

type CustomDirectiveMap = {
  [DirectiveName in Exclude<
    keyof DirectiveMap,
    BuiltInDirectives
  >]: DirectiveMap[DirectiveName]
};

export type DirectiveResolverMap = {
  [DirectiveName in keyof CustomDirectiveMap]: DirectiveResolver<
    DirectiveMap[DirectiveName]['args'],
    SchemaContext
  >
};

// export type UnionResolverMap = {
//   [UnionName in keyof UnionMap]: {
//     __resolveType: UnionOrInterfaceResolver<
//       UnionMap[UnionName]['unionType'],
//       UnionMap[UnionName]['possibleTypeNames'],
//       SchemaContext
//     >;
//   }
// };

export type InterfaceResolverMap = {
  [InterfaceName in keyof InterfaceMap]: {
    __resolveType: UnionOrInterfaceResolver<
      InterfaceMap[InterfaceName]['interfaceType'],
      InterfaceMap[InterfaceName]['implementorTypeNames'],
      SchemaContext
    >;
  }
};
