export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export function isApiErrorResponse(payload: unknown): payload is ApiErrorResponse {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'message' in payload &&
    'statusCode' in payload
  );
}
