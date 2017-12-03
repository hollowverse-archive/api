import { GraphQLScalarType } from 'graphql/type';
import { ASTNode, Kind } from 'graphql/language';
import { GraphQLError } from 'graphql/error';

import * as isUrl from 'validator/lib/isURL';

import { urlValidationOptions } from '../../helpers/validation';

// Called when the user passes the value inline
const parseLiteral = (ast: ASTNode) => {
  if (ast.kind === Kind.STRING && isUrl(ast.value, urlValidationOptions)) {
    return ast.value;
  }

  throw new GraphQLError('Invalid URL', [ast]);
};

export const Url = new GraphQLScalarType({
  name: 'URL',
  description:
    'A full URL with the protocol. Accepted protocols are http and https only.',

  parseLiteral,

  // Called when the user passes the value as an input variable
  parseValue(value) {
    return parseLiteral({ kind: Kind.STRING, value });
  },

  serialize(value) {
    return String(value);
  },
});
