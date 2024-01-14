import { randomUUID } from 'crypto';
import NotFoundException from '../exceptions/common/NotFound';
import ChatRepository from '../repositories/chat/ChatRespository';
import UserRepository from '../repositories/user/UserRepository';
import BadRequestException from '../exceptions/common/BadRequest';
import SendMessageMessage from '../messages/SendMessageMessage';
import MessageRepository from '../repositories/message/MessageRepository';

export default class ChatService {
  constructor(
    private chatRespository: ChatRepository,
    private messageRepository: MessageRepository,
    private userRepository: UserRepository,
    private sendMessageMessage: SendMessageMessage,
  ) {}

  async get(uid: string) {
    return this.chatRespository.get(uid).then((chat) => {
      if (!chat) throw new NotFoundException('chat');
      return chat;
    });
  }

  async getByUser(uid: string) {
    return this.chatRespository.getByUser(uid).then((chat) => {
      if (!chat) throw new NotFoundException('user');
      return chat;
    });
  }

  async startChat(initiator: string, reciever: string) {
    if (initiator === reciever) {
      throw new BadRequestException(
        'User',
        "users can't start a chat with themselves",
      );
    }
    const users = await this.userRepository.getMultiple([initiator, reciever]);

    if (users.length !== 2) {
      throw new NotFoundException('recipient');
    }

    const user1 = users.at(0)!;
    const user2 = users.at(1)!;

    const chatUid = randomUUID();

    await this.chatRespository.create({
      uid: chatUid,
      user_1_id: user1.id,
      user_2_id: user2.id,
    });

    return chatUid;
  }

  async sendMessage(chatUid: string, senderUid: string, content: string) {
    const [user, chatId] = await Promise.all([
      this.userRepository.get(senderUid).then((u) => {
        if (!u) throw new NotFoundException('sender');
        return u;
      }),
      this.chatRespository.getId(chatUid).then((c) => {
        if (!c) throw new NotFoundException('chat');
        return c;
      }),
    ]);

    const message = {
      uid: randomUUID(),
      user: {
        username: user.username,
        provider_id: user.provider_id,
      },
      content,
      seen_at: null,
      sent_at: new Date(Date.now()),
    };

    this.messageRepository.create({
      uid: message.uid,
      chat_id: chatId,
      from_user_id: user.id,
      content,
      sent_at: message.sent_at,
    });

    this.sendMessageMessage.publish({
      ...message,
      chat_uid: chatUid,
    });

    return message;
  }
}
