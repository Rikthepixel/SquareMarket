import {
  ChatConnection,
  connectToChat,
  getChats,
  startChat,
} from '@/apis/messages/chats';
import Resource from '@/helpers/Resource';
import { ChatResponse } from '@/responses/messages/ChatResponse';
import { ChatsResponse } from '@/responses/messages/ChatsResponse';
import { create } from 'zustand';

interface ChatsState {
  chats: Resource<ChatsResponse>;
  chat: Resource<[ChatResponse, ChatConnection]>;

  startChat(userUid: string): Promise<string>;
  getChats(): Promise<void>;

  connectToChat(uid: string): Promise<void>;
  disconnect(): void;
}

const useChats = create<ChatsState>((set, get) => ({
  chats: Resource.idle(),
  chat: Resource.idle(),

  async startChat(userUid) {
    return await startChat(userUid).then((res) => res.uid);
  },

  async getChats() {
    const resource = get().chats.abort().reload();

    set({
      chats: await Resource.wrapPromise(getChats(resource.signal())),
    });
  },

  async connectToChat(uid) {
    const resource = get().chat.abort().reload();
    set({ chat: resource });
    const connection = await connectToChat(uid, resource.signal());

    connection.addEventListener('chat-init', (event) => {
      set({ chat: Resource.wrapValue([event.data, connection]) });
    });

    connection.addEventListener('chat-message', (event) => {
      set((state) => ({
        chat: state.chat.map(([chat, connection]) => [
          { ...chat, messages: [...chat.messages, event.data] },
          connection,
        ]),
      }));
    });

    connection.addEventListener('close', (event) => {
      if (!event.closedByClient) {
        set({
          chat: Resource.wrapError(new Error('Server closed the chat')),
        });
      }
      set({ chat: Resource.idle() });
    });
  },

  disconnect() {
    const state = get();
    state.chat.abort();
  },
}));

export default useChats;
