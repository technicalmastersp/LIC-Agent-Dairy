
export type Ticket = {
  ticketId: string;
  category: string;
  createdAt?: string;
  status: string;
  message: string;
  adminReply?: string;
};
export type Suggestion = {
  _id: string;
  title: string;
  message: string;
  status: string;
};
export type FaqItem = { q: string; a: string; category: string };
