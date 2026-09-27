import httpClient from './http-client';

export interface DashboardSummary {
  totalUsers: number;
  activeSessions: number;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await httpClient.get<DashboardSummary>('/dashboard/summary');
  return data;
}
