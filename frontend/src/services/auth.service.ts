import httpClient from './http-client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await httpClient.post<LoginResponse>('/auth/login', payload);
  return data;
}

export async function logout(): Promise<void> {
  await httpClient.post('/auth/logout');
}

export async function forgotPassword(email: string): Promise<void> {
  await httpClient.post('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await httpClient.post('/auth/reset-password', { token, password });
}
