import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date';
import { createUser } from './mutations/createUser';
import { viewer } from './queries/viewer';
import notablePersonResolvers from './queries/notablePerson';
import { merge } from 'lodash';

export const resolvers = merge(
  {
    DateTime: GraphQLDateTime,

    DateOnly: GraphQLDate,

    RootQuery: {
      viewer,
    },

    RootMutation: {
      createUser,
    },
  },
  notablePersonResolvers,
);
