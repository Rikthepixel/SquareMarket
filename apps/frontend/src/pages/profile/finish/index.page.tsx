import {
  FinishProfileRequest,
  finishProfileRequestSchema,
} from '@/requests/accounts/self/FinishProfileRequest';
import useProfile from '@/stores/useProfile';
import {
  Card,
  Text,
  Stack,
  TextInput,
  Button,
  Select,
  Divider,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useEffect } from 'react';
import { MdSave } from 'react-icons/md';
import { useLocation } from 'wouter';

export default function FinishProfilePage() {
  const { status, finish, getStatus } = useProfile();
  const [, setLocation] = useLocation();

  const { getInputProps, onSubmit } = useForm<FinishProfileRequest>({
    validate: zodResolver(finishProfileRequestSchema),
    validateInputOnChange: true,
  });

  useEffect(() => {
    if (status !== 'complete') return;
    setLocation('/', { replace: true });
  }, [status, setLocation]);

  return (
    <Card
      shadow="md"
      w="480px"
      m="auto"
      p="md"
      maw="100%"
      component="form"
      onSubmit={onSubmit((req) => finish(req).then(() => getStatus()))}
    >
      <Card.Section p="md" bg="red">
        <Text component="h1" fz="2rem" ta="center" c="white">
          Finish profile
        </Text>
      </Card.Section>
      <Stack gap="md" mt="md">
        <Text fz="sm" fw={600}>
          We need some extra information before you can start using
          SquareMarket. All of these can be changed later in your profile
          settings.
        </Text>
        <Divider />
        <TextInput
          label="Pick your username"
          placeholder="Username"
          {...getInputProps('username')}
        />
        <Select
          label="Pick your default currency"
          placeholder="EUR"
          data={['EUR', 'USD']}
          {...getInputProps('default_currency')}
        />
        <Button type="submit" leftSection={<MdSave />}>
          Save
        </Button>
      </Stack>
    </Card>
  );
}
