import PageContainer from '@/components/page/Container';
import useTypedParams from '@/hooks/useTypedParams';
import useChats from '@/stores/useChats';
import {
  Text,
  Group,
  Stack,
  Divider,
  ActionIcon,
  Skeleton,
  Center,
  Paper,
} from '@mantine/core';
import { useEffect } from 'react';
import { MdChevronLeft } from 'react-icons/md';
import { Link } from 'wouter';
import { z } from 'zod';
import MessageBubble from './components/MessageBubble';
import useAuth from '@/lib/auth/stores/useAuth';
import MessageInput from './components/MessageInput';

const PARAMS_SCHEMA = z.object({
  uid: z.string().uuid(),
});

export default function MessagePage() {
  const params = useTypedParams(PARAMS_SCHEMA);
  const { chat, connectToChat, disconnect } = useChats();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (!params?.uid) return;
    connectToChat(params.uid);
    return () => disconnect();
  }, [connectToChat, disconnect, params?.uid]);

  const user = chat
    .unwrapValue()?.[0]
    ?.users.find((_user) => _user.provider_id !== currentUser?.providerId);

  return (
    <PageContainer display="flex">
      <Stack
        bg="#fff"
        pos="sticky"
        top={0}
        gap="md"
        pt="md"
        mb="md"
        style={{ zIndex: 1 }}
      >
        <Group px="md">
          <Link href="/messages">
            <ActionIcon component="a" variant="light">
              <MdChevronLeft />
            </ActionIcon>
          </Link>
          {chat
            .map(() => <Text fz="2rem">{user?.username}</Text>)
            .catch(() => 'User could not be loaded')
            .pending(() => <Skeleton height="2rem" width="5rem" />)
            .unwrap()}
        </Group>
        <Divider />
      </Stack>
      {chat
        .map(([chat, connection]) => {
          return (
            <>
              <Stack gap="md" style={{ flex: 1 }}>
                {chat.messages.length === 0 && (
                  <Center>
                    <Paper p="md" withBorder>
                      This is the start if your beautiful conversation with{' '}
                      {user?.username}
                    </Paper>
                  </Center>
                )}
                {chat.messages.map((message, idx, arr) => (
                  <MessageBubble
                    key={message.uid}
                    username={message.user.username}
                    content={message.content}
                    sentAt={message.sent_at}
                    fromSelf={
                      message.user.provider_id === currentUser?.providerId
                    }
                    latest={idx === arr.length - 1}
                  />
                ))}
              </Stack>
              <Stack
                bg="#fff"
                pos="sticky"
                bottom={0}
                pb="md"
                mt="md"
                style={{ zIndex: 1 }}
              >
                <Divider />
                <MessageInput
                  onSend={(content) => connection.sendMessage(content)}
                />
              </Stack>
            </>
          );
        })
        .catch((err) => err.message)
        .pending(() => <Skeleton />)
        .unwrap()}
    </PageContainer>
  );
}
