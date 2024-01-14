import { getChats, startChat } from '@/apis/messages/chats';
import Resource from '@/helpers/Resource';
import { getToken } from '@/lib/auth';
import { ChatsResponse } from '@/responses/ads/messages/ChatsResponse';
import { create } from 'zustand';

interface ChatsState {
  chats: Resource<ChatsResponse>;
  chat: Resource<{}>;

  startChat(userUid: string): Promise<void>;
  getChats(): Promise<void>;

  connectToChat(uid: string): Promise<void>;
  disconnect(): Promise<void>;
}

const useChats = create<ChatsState>((set, get) => ({
  chats: Resource.idle(),
  chat: Resource.idle(),

  async startChat(userUid) {
    await startChat(userUid);
  },

  async getChats() {
    const resource = get().chats.abort().reload();

    set({
      chats: await Resource.wrapPromise(getChats(resource.signal())),
    });
  },

  async connectToChat(uid) {
    const token = await getToken();
    if (!token) return;

    const resource = get().chat.abort().reload();
    set({ chat: resource });

    const url = new URL(import.meta.env.VITE_BACKEND_URL);
    url.pathname = `v1/chats/${uid}`;
    url.protocol = url.protocol === 'http:' ? 'ws:' : 'wss:';
    url.searchParams.set('token', token);
    // url.port = '8003';

    const socket = new WebSocket(url);

    socket.onopen = function (e) {
      if (resource.signal()?.aborted) return socket.close();
    };

    socket.onmessage = function (e) {
      if (resource.signal()?.aborted) return socket.close();
      const data = JSON.parse(e.data.toString())
      console.log(data);
    };

    socket.onclose = function (e) {
      if (e.code === 1000) return; // Client closed connection
    }
  },

  async disconnect() {},
}));

export default useChats;
