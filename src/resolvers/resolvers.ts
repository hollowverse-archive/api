import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date';
import { createUser } from './mutations/createUser';
import { viewer } from './queries/viewer';
import { notablePerson } from './queries/notablePerson';

export const resolvers = {
  DateTime: GraphQLDateTime,

  DateOnly: GraphQLDate,

  RootQuery: {
    viewer,
    notablePerson,
  },

  RootMutation: {
    createUser,
  },
};
