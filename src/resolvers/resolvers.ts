import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date';
import { createUser } from './mutations/createUser';
import { createNotablePerson } from './mutations/createNotablePerson';
import { viewer } from './queries/viewer';
import { requireAuthentication } from '../helpers/requireAuthentication';
import notablePersonResolvers from './queries/notablePerson';
import { merge } from 'lodash';
import { Email } from './scalars/email';
import { Url } from './scalars/url';

/**
 * Resolvers for custom scalar types.
 * They define how to parse, validate and serialize these types.
 */
const scalarTypes = {
  DateTime: GraphQLDateTime,
  DateOnly: GraphQLDate,
  Email,
  Url,
};

export const resolvers = merge(
  {
    RootQuery: {
      viewer,
    },

    RootMutation: {
      createUser,
      createNotablePerson: requireAuthentication(createNotablePerson),
    },
  },
  scalarTypes,
  notablePersonResolvers,
);
