import { DirectiveResolverMap } from '../../typings/resolverMap';

export const resolvers: Pick<DirectiveResolverMap, 'requireRoles'> = {
  async requireRoles(_next, _source, _args, _context) {
    throw new Error('Roles for users are not implemented yet');
  },
};
