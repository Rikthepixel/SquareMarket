import backend from '@/adapters/backend';
import { chatsResponseSchema } from '@/responses/messages/ChatsResponse';
import { getToken } from '@/lib/auth';
import {
  ChatResponse,
  chatResponseSchema,
} from '@/responses/messages/ChatResponse';
import {
  ChatMessageResponse,
  chatMessageResponseSchema,
} from '@/responses/messages/ChatMessageResponse';
import { chatCreatedResponse } from '@/responses/messages/ChatCreatedResponse';

export function startChat(userUid: string) {
  return backend
    .post('v1/chats', { json: { user: userUid } })
    .then(async (res) => chatCreatedResponse.parse(await res.json()));
}

export async function getChats(signal?: AbortSignal) {
  return await backend
    .get('v1/chats', { signal })
    .then(async (res) => chatsResponseSchema.parse(await res.json()));
}

export class ChatConnection {
  constructor(
    private target: EventTarget,
    private socket: WebSocket,
  ) {}

  addEventListener(
    type: 'open',
    callback: (event: OpenedEvent) => void | null,
    options?: boolean | AddEventListenerOptions | undefined,
  ): void;
  addEventListener(
    type: 'chat-message',
    callback: (event: ChatMessageEvent) => void | null,
    options?: boolean | AddEventListenerOptions | undefined,
  ): void;
  addEventListener(
    type: 'chat-init',
    callback: (event: ChatInitEvent) => void | null,
    options?: boolean | AddEventListenerOptions | undefined,
  ): void;
  addEventListener(
    type: 'close',
    callback: (event: ClosedEvent) => void | null,
    options?: boolean | AddEventListenerOptions | undefined,
  ): void;
  addEventListener(
    type: string,
    callback: (event: any) => void | null,
    options?: boolean | AddEventListenerOptions | undefined,
  ): void {
    this.target.addEventListener(type, callback, options);
  }

  removeEventListener(
    type: 'open' | 'close',
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions | undefined,
  ): void {
    this.target.removeEventListener(type, callback, options);
  }

  sendMessage(content: string) {
    this.socket.send(
      JSON.stringify({
        type: 'chat-message',
        content: content,
      }),
    );
  }

  disconnect() {
    this.socket.close();
  }
}

class OpenedEvent extends Event {
  constructor() {
    super('open');
  }
}
class ClosedEvent extends Event {
  constructor(public closedByClient: boolean) {
    super('close');
  }
}

class ChatInitEvent extends Event {
  constructor(public data: ChatResponse) {
    super('chat-init');
  }
}

class ChatMessageEvent extends Event {
  constructor(public data: ChatMessageResponse) {
    super('chat-message');
  }
}

const events = {
  'chat-message': (data: unknown) =>
    new ChatMessageEvent(chatMessageResponseSchema.parse(data)),
  'chat-init': (data: unknown) =>
    new ChatInitEvent(chatResponseSchema.parse(data)),
} as const;

export async function connectToChat(uid: string, signal?: AbortSignal) {
  const token = await getToken();
  if (!token) {
    throw new Error('User must be authenticated to connect to this chat');
  }

  const url = new URL(import.meta.env.VITE_BACKEND_URL);
  url.pathname = `v1/chats/${uid}`;
  url.protocol = url.protocol === 'http:' ? 'ws:' : 'wss:';
  url.searchParams.set('token', token);

  const socket = new WebSocket(url);
  const target = new EventTarget();

  signal?.addEventListener('abort', function () {
    socket.close();
  });

  socket.onopen = function () {
    if (signal?.aborted) return socket.close();
    target.dispatchEvent(new OpenedEvent());
  };

  socket.onmessage = function (e) {
    if (signal?.aborted) return socket.close();
    const data = JSON.parse(e.data.toString()) as unknown;
    if (
      typeof data !== 'object' ||
      !data ||
      !('type' in data) ||
      typeof data.type !== 'string'
    ) {
      return;
    }
    const event = Object.keys(events).includes(data.type)
      ? events[data.type as keyof typeof events]
      : null;

    if (!event) return;
    target.dispatchEvent(event(data));
  };

  socket.onclose = function (e) {
    target.dispatchEvent(new ClosedEvent(e.code === 1000));
  };

  return new ChatConnection(target, socket);
}
