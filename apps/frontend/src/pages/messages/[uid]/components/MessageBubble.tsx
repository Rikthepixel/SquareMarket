import { Text, Group, Stack, Paper } from '@mantine/core';
import { useEffect, useRef } from 'react';

interface MessageBubbleProps {
  username: string;
  content: string;
  sentAt: Date;
  fromSelf: boolean;
  latest: boolean;
}

export default function MessageBubble(props: MessageBubbleProps) {
  const bubbleRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!props.latest) return;
    bubbleRef.current?.scrollIntoView({ behavior: "auto"})

  }, [props.latest])

  return (
    <Paper
      ref={bubbleRef}
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
