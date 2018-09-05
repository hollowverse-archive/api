import { UserRole, RootMutation } from '../typings/schema';

type CanUserWithRoleXMutateUserWithRoleYOptions = {
  roleX: UserRole | null;
  roleY: UserRole | null;
  mutation: keyof RootMutation;
};

export const canUserWithRoleXMutateUserWithRoleY = ({
  roleX,
  roleY,
}: CanUserWithRoleXMutateUserWithRoleYOptions): boolean => {
  // This is the only role that can mutate users currently.
  if (roleX === 'MODERATOR') {
    return roleY === null;
  }

  return false;
};
