import { useAppSelector } from '@/redux/hooks';

export function useAuth() {
  const { isAuthenticated, accessToken } = useAppSelector((state) => state.auth);
  return { isAuthenticated, accessToken };
}
