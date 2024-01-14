import PageContainer from '@/components/page/Container';
import useChats from '@/stores/useChats';
import { Center, Group, Paper, Stack, Text, TextInput } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { useEffect } from 'react';
import { MdChevronRight, MdSearch } from 'react-icons/md';
import { Link } from 'wouter';

interface Conversation {
  uid: string;
  user: string;
  latestMessage: string;
  latestMessageDate: Date;
}

function ConversationRow({ conversation }: { conversation: Conversation }) {
  const { ref, hovered } = useHover();

  return (
    <Link {...({ ref } as object)} href={`/messages/${conversation.uid}`}>
      <Paper component="a" c={hovered ? 'red' : 'dark'} p="md" withBorder>
        <Group wrap="noWrap">
          <Stack w="100%">
            <Text fw={600} fz="lg">
              {conversation.user}
            </Text>
            <Text>{conversation.latestMessage}</Text>
            <Text fz="sm" opacity={0.75}>
              {conversation.latestMessageDate.toLocaleDateString()}
            </Text>
          </Stack>
          <Center fz="2rem">
            <MdChevronRight />
          </Center>
        </Group>
      </Paper>
    </Link>
  );
}

export default function MessagesPage() {
  const { connectToChat } = useChats();

  useEffect(() => {
    connectToChat('9f783b23-b243-11ee-abb1-0242ac130002');
  }, [connectToChat]);

  const conversations = Array(10)
    .fill(1)
    .map<Conversation>((_, idx) => {
      return {
        uid: String(idx),
        user: 'John Doe ' + idx,
        latestMessage:
          'Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint cillum sint consectetur cupidatat. Latest message contents',
        latestMessageDate: new Date(),
      };
    });

  return (
    <PageContainer>
      <Stack gap="md">
        <Text component="h1" fz="2rem">
          Messages
        </Text>
        <TextInput
          size="md"
          placeholder="Search by username"
          rightSection={<MdSearch />}
        />
        <Stack>
          {conversations.map((convo, idx) => (
            <ConversationRow key={idx} conversation={convo} />
          ))}
        </Stack>
      </Stack>
    </PageContainer>
  );
}
