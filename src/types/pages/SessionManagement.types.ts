export interface Session {
  sessionId: string;
  device: string;
  ip: string;
  location: string;
  createdAt: string;
  isCurrent: boolean;
}