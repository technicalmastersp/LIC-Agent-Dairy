
export interface ActivityLog {
  _id: string;
  action: string;
  adminName?: string;
  adminRole?: string;
  targetUserName?: string;
  createdAt?: string;
  details?: unknown;
}
export interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}
