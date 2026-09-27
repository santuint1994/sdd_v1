import { useAppSelector } from '@/redux/hooks';

export function usePermission(requiredRoles: string[]): boolean {
  const role = useAppSelector((state) => state.user.role);
  if (!role) return false;
  return requiredRoles.includes(role);
}
