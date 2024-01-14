import { ActionIcon, Group, Textarea } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { MdSend } from 'react-icons/md';
import { z } from 'zod';

interface MessageInputProps {
  onSend(content: string): void;
}

const formSchema = z.object({
  content: z.string().min(1),
});

type FormSchema = z.infer<typeof formSchema>;
const resolver = zodResolver(formSchema);

export default function MessageInput(props: MessageInputProps) {
  const { getInputProps, reset, onSubmit } = useForm<FormSchema>({
    validate: resolver,
    validateInputOnChange: true,
    initialValues: {
      content: '',
    },
  });

  const handleSubmit = onSubmit((data) => {
    props.onSend(data.content);
    reset();
  });

  return (
    <Group>
      <Textarea
        {...getInputProps('content')}
        size="md"
        maxRows={4}
        placeholder="Message"
        style={{ flex: 1 }}
        autosize
      />
      <ActionIcon size="lg" onClick={handleSubmit}>
        <MdSend />
      </ActionIcon>
    </Group>
  );
}
