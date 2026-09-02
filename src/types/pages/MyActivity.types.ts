
export interface ActivityLog {
  _id: string;
  action: string;
  targetUserName?: string;
  createdAt?: string;
  details?: unknown;
}
export interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}
