import { DirectiveResolverMap } from '../../typings/resolverMap';

export const resolvers: Pick<DirectiveResolverMap, 'requireOneOfRoles'> = {
  async requireOneOfRoles(next, _source, { roles }, { viewer }) {
    if (viewer && viewer.role && roles.includes(viewer.role)) {
      return next();
    }

    throw new TypeError(
      `Only users with one of the following role(s) are allowed to perform this: ${roles.join(
        ', ',
      )}.`,
    );
  },
};
