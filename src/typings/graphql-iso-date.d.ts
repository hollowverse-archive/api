declare module 'graphql-iso-date' {
  import { GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
  export const GraphQLDate: GraphQLScalarType &
    GraphQLScalarTypeConfig<Date, string>;
  export const GraphQLDateTime: GraphQLScalarType &
    GraphQLScalarTypeConfig<Date, string>;
  export const GraphQLTime: GraphQLScalarType &
    GraphQLScalarTypeConfig<Date, string>;
}
