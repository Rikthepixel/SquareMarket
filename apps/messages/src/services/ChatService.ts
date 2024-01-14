import NotFoundException from '../exceptions/common/NotFound';
import ChatRepository from '../repositories/chat/ChatRespository';

export default class ChatService {
  constructor(private chatRespository: ChatRepository) {}

  async get(uid: string) {
    return this.chatRespository.get(uid).then((chat) => {
      if (!chat) throw new NotFoundException('chat');
      return chat;
    });
  }
}
