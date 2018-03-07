import { GraphQLScalarType } from 'graphql/type';
import { ASTNode, Kind } from 'graphql/language';
import { GraphQLError } from 'graphql/error';

import isHexColor from 'validator/lib/isHexColor';

// Called when the user passes the value inline
const parseLiteral = (ast: ASTNode) => {
  if (
    ast.kind === Kind.STRING &&
    isHexColor(ast.value) &&
    ast.value.startsWith('#')
  ) {
    return ast.value;
  }

  throw new GraphQLError('Invalid value for HexColor', [ast]);
};

export const HexColor = new GraphQLScalarType({
  name: 'HexColor',
  description: 'A valid hexadecimal color string, must start with `#`.',

  parseLiteral,

  // Called when the user passes the value as an input variable
  parseValue(value) {
    return parseLiteral({ kind: Kind.STRING, value });
  },

  serialize(value) {
    return String(value);
  },
});
