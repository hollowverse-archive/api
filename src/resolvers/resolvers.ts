import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date';
import { createUser } from './mutations/createUser';
import { viewer } from './queries/viewer';
import notablePersonResolvers from './queries/notablePerson';
import { merge } from 'lodash';
import { Email } from './scalars/email';
import { Url } from './scalars/url';

export const resolvers = merge(
  {
    DateTime: GraphQLDateTime,

    DateOnly: GraphQLDate,

    Email,

    Url,

    RootQuery: {
      viewer,
    },

    RootMutation: {
      createUser,
    },
  },
  notablePersonResolvers,
);
