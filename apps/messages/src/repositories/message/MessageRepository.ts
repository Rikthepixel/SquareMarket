export interface CreatableMessage {
  uid: string;
  content: string;
  from_user_id: number;
  chat_id: number;
  sent_at: Date;
}

export default interface MessageRepository {
  create(msg: CreatableMessage): Promise<void>;
}
