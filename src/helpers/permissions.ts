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
  return roleX === 'MODERATOR' && roleY === null;
};
