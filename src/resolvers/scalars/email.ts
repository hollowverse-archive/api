import { GraphQLScalarType } from 'graphql';
import { ASTNode, Kind } from 'graphql/language';
import { GraphQLError } from 'graphql/error';

import * as isEmail from 'validator/lib/isEmail';

// Called when the user passes the value inline
const parseLiteral = (ast: ASTNode) => {
  if (ast.kind === Kind.STRING && isEmail(ast.value)) {
    return ast.value;
  }

  throw new GraphQLError('Invalid email address', [ast]);
};

export const Email = new GraphQLScalarType({
  name: 'Email',
  description: 'A valid email address',

  parseLiteral,

  // Called when the user passes the value as an input variable
  parseValue(value) {
    return parseLiteral({ kind: Kind.STRING, value });
  },

  serialize(value) {
    return String(value);
  },
});
