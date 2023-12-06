import {
  AspectRatio,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Image,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useCallback, useMemo } from 'react';
import { MdFilterAlt, MdLocationOn, MdSearch } from 'react-icons/md';
import PageContainer from '@/components/page/Container';
import backend from '@/adapters/backend';

interface Advertisement {
  uid: string;
  title: string;
  description: string;
  pictures: [string, ...string[]];
  price: number;
  currency: string;
  location: string;
}

function AdvertisementCard({ ad }: { ad: Advertisement }) {
  const firstPicture = ad.pictures[0];

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: ad.currency,
        notation: 'standard',
      }),
    [ad.currency],
  );

  return (
    <Card component="article" radius="xl" shadow="sm" withBorder>
      <Card.Section>
        <AspectRatio ratio={4 / 3}>
          <Image src={firstPicture} alt="Ad picture" />
        </AspectRatio>
      </Card.Section>
      <Stack gap="xs">
        <Group mt="md" gap="xs">
          <Badge variant="light">
            <Text>{currencyFormatter.format(ad.price)}</Text>
          </Badge>
          <Text fz="lg">{ad.title}</Text>
        </Group>
        <Text fz="sm">{ad.location}</Text>
        <Text>{ad.description}</Text>
      </Stack>
    </Card>
  );
}

export default function FrontPage() {
  const ads: Advertisement[] = Array(20)
    .fill(1)
    .map((_, idx) => {
      return {
        uid: String(idx),
        title: 'Sample',
        description: 'Sample',
        pictures: ['/some-pic.jpg'],
        price: Math.round(Math.random() * 10000) * 0.01,
        currency: 'EUR',
        location: 'Gorinchem, Gelderland, Netherlands',
      };
    });

  return (
    <PageContainer>
      <Group justify="center">
        <TextInput
          size="md"
          placeholder="Search on title and description"
          rightSection={<MdSearch />}
        />
        <Button size="md" rightSection={<MdLocationOn />}>
          Location
        </Button>
        <Button size="md" rightSection={<MdFilterAlt />}>
          Filters
        </Button>
        <Button size="md" rightSection={<MdSearch />}>
          Search
        </Button>
      </Group>
      <Grid mt="md">
        {ads.map((ad) => (
          <Grid.Col key={ad.uid} span={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <AdvertisementCard ad={ad} />
          </Grid.Col>
        ))}
      </Grid>
    </PageContainer>
  );
}
