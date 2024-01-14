import backend from '@/adapters/backend';
import { chatsResponseSchema } from '@/responses/ads/messages/ChatsResponse';

export function startChat(userUid: string) {
  return backend.post('v1/chats', { json: { user_uid: userUid } });
}

export async function getChats(signal?: AbortSignal) {
  return await backend
    .get('v1/chats', { signal })
    .then((res) => chatsResponseSchema.parse(res.json()));
}
