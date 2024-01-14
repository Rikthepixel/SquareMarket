import { Text, Group, Stack, Paper } from '@mantine/core';

interface MessageBubbleProps {
  username: string;
  content: string;
  sentAt: Date;
  fromSelf: boolean;
}

export default function MessageBubble(props: MessageBubbleProps) {
  return (
    <Paper
      bg={props.fromSelf ? 'red' : 'blue'}
      maw="80%"
      p="md"
      ml={props.fromSelf ? 'auto' : undefined}
      mr={!props.fromSelf ? 'auto' : undefined}
    >
      <Stack>
        <Group align="baseline">
          <Text c="#fff" fw="600">{props.username}</Text>
          <Text c="#fff" fz="xs">
            {props.sentAt.toLocaleString()}
          </Text>
        </Group>
        <Text c="#fff">
          {props.content}
        </Text>
      </Stack>
    </Paper>
  );
}
