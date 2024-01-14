import PageContainer from '@/components/page/Container';
import useAuth from '@/lib/auth/stores/useAuth';
import useChats from '@/stores/useChats';
import {
  Center,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useHover } from '@mantine/hooks';
import { useEffect, useMemo } from 'react';
import { MdChevronRight, MdSearch } from 'react-icons/md';
import { Link } from 'wouter';
import { z } from 'zod';

interface ChatItemProps {
  uid: string;
  username: string;
}

function ChatItem(props: ChatItemProps) {
  const { ref, hovered } = useHover();

  return (
    <Link {...({ ref } as object)} href={`/messages/${props.uid}`}>
      <Paper component="a" c={hovered ? 'red' : 'dark'} p="md" withBorder>
        <Group wrap="noWrap">
          <Stack w="100%">
            <Text fw={600} fz="lg">
              {props.username}
            </Text>
            {/* <Text>{conversation.latestMessage}</Text> */}
            {/* <Text fz="sm" opacity={0.75}> */}
            {/*   {conversation.latestMessageDate.toLocaleDateString()} */}
            {/* </Text> */}
          </Stack>
          <Center fz="2rem">
            <MdChevronRight />
          </Center>
        </Group>
      </Paper>
    </Link>
  );
}

const formSchema = z.object({
  search: z.string().nullish(),
});
type FormSchema = z.infer<typeof formSchema>;
const resolver = zodResolver(formSchema);

export default function MessagesPage() {
  const { chats, getChats } = useChats();
  const { user } = useAuth();

  useEffect(() => {
    getChats();
  }, [getChats]);

  const { getInputProps, values } = useForm<FormSchema>({
    validate: resolver,
    initialValues: {
      search: '',
    },
  });

  const renderedChats = useMemo(() => {
    return chats
      .map((chats) => {
        const filtered = chats.filter((chat) => {
          const other = chat.users.find(
            (u) => u.provider_id !== user?.providerId,
          );
          if (!other) return false;
          return other.username
            .toLowerCase()
            .includes(values.search?.toLowerCase() ?? '');
        });

        return (
          <Stack>
            {filtered.map((chat) => {
              const other = chat.users.find(
                (u) => u.provider_id !== user?.providerId,
              );
              if (!other) {
                throw new Error(
                  "You are in a chat with yourself. I don't know how you managed that",
                );
              }
              return (
                <ChatItem
                  key={chat.uid}
                  uid={chat.uid}
                  username={other.username}
                />
              );
            })}
          </Stack>
        );
      })
      .catch((err) => err.message)
      .pending(() =>
        Array(5)
          .fill(true)
          .map(() => {
            return <Skeleton width="100%" height="4rem" />;
          }),
      )
      .unwrap();
  }, [chats, user]);

  return (
    <PageContainer>
      <Stack gap="md">
        <Text component="h1" fz="2rem">
          Messages
        </Text>
        <TextInput
          {...getInputProps('search')}
          size="md"
          placeholder="Search by username"
          rightSection={<MdSearch />}
        />
        {renderedChats}
      </Stack>
    </PageContainer>
  );
}
