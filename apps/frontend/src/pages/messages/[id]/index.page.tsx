import PageContainer from '@/components/page/Container';
import {
  Alert,
  Text,
  Group,
  Stack,
  Divider,
  Box,
  Button,
  ActionIcon,
  Textarea,
} from '@mantine/core';
import { MdChevronLeft, MdSend } from 'react-icons/md';
import { Link } from 'wouter';

interface Message {
  uid: string;
  user: {
    uid: string;
    name: string;
  };
  text: string;
  createdAt: Date;
}

interface Conversation {
  user: {
    uid: string;
    name: string;
  };
  messages: Message[];
}

function MessageBubble({
  message,
  fromSelf,
}: {
  message: Message;
  fromSelf: boolean;
}) {
  return (
    <Alert
      variant="light"
      color={fromSelf ? 'red' : 'blue'}
      maw="80%"
      ml={fromSelf ? 'auto' : undefined}
      mr={!fromSelf ? 'auto' : undefined}
      title={
        <Group align="baseline">
          <Text>{message.user.name}</Text>
          <Text fz="xs">{message.createdAt.toLocaleString()}</Text>
        </Group>
      }
    >
      {message.text}
    </Alert>
  );
}

export default function MessagePage() {
  const conversation: Conversation = {
    user: {
      uid: '2',
      name: 'John',
    },
    messages: Array(20)
      .fill(1)
      .map<Message>((_, idx) => ({
        uid: String(idx),
        user: {
          uid: idx % 2 === 1 ? '1' : '2',
          name: idx % 2 === 1 ? 'Rik' : 'John',
        },
        text: 'Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint cillum sint consectetur cupidatat.',
        createdAt: new Date(),
      })),
  };

  return (
    <PageContainer>
      <Stack bg="#fff" pos="sticky" top={0} gap="md" pt="md" mb="md" style={{ zIndex: 1 }}>
        <Group px="md">
          <Link href="/messages">
            <ActionIcon component="a" variant="light">
              <MdChevronLeft />
            </ActionIcon>
          </Link>
          <Text fz="2rem">{conversation.user.name}</Text>
        </Group>
        <Divider />
      </Stack>
      <Stack gap="md">
        {conversation.messages.map((message) => (
          <MessageBubble
            key={message.uid}
            message={message}
            fromSelf={message.user.uid === '1'}
          />
        ))}
      </Stack>
      <Stack bg="#fff" pos="sticky" bottom={0} pb="md" mt="md" style={{ zIndex: 1 }}>
        <Divider />
        <Group>
          <Textarea
            size="md"
            maxRows={4}
            placeholder="Message"
            style={{ flex: 1 }}
            autosize
          />
          <ActionIcon size="lg">
            <MdSend />
          </ActionIcon>
        </Group>
      </Stack>
    </PageContainer>
  );
}
