
export interface MockAxiosError {
  response?: { status: number; data?: Record<string, unknown> };
  config: Record<string, unknown>;
}
export type RejectedHandler = (error: MockAxiosError) => Promise<never>;
export interface InterceptorHandlers {
  handlers: Array<{ rejected: RejectedHandler } | null>;
}
