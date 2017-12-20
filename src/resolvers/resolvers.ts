import { merge } from 'lodash';

import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date';
import { Email } from './scalars/email';
import { Url } from './scalars/url';

import { resolvers as createNotablePersonResolvers } from './mutations/createNotablePerson';
import { resolvers as notablePersonResolvers } from './queries/notablePerson';
import { resolvers as createUserResolvers } from './mutations/createUser';
import { resolvers as userResolvers } from './types/user';
import { resolvers as viewerResolvers } from './types/viewer';

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
  createUserResolvers,
  createNotablePersonResolvers,
  viewerResolvers,
  notablePersonResolvers,
  userResolvers,
  viewerResolvers,
  scalarTypes,
);
