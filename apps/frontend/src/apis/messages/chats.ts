import backend from '@/adapters/backend';

export function startConversation(userUid: string) {
  return backend.post('v1/chats', { json: { user_uid: userUid } });
}
