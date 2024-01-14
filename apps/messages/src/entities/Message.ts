export interface Message {
  id: number;
  uid: string;
  from_user_id: number;
  chat_id: number;
  content: string;
  seen_at: Date | null;
  sent_at: Date;
}
