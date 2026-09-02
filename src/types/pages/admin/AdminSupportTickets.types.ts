
export interface SupportTicket {
  ticketId: string;
  name: string;
  email: string;
  createdAt?: string;
  isGuest?: boolean;
  guestMatchedAccount?: boolean;
  status: string;
  category: string;
  message: string;
  adminReply?: string;
}
