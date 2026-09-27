import httpClient from './http-client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function getCurrentUser(): Promise<UserProfile> {
  const { data } = await httpClient.get<UserProfile>('/users/me');
  return data;
}
