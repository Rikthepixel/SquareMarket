import {
  Badge,
  Button,
  Group,
  Image,
  Paper,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
} from '@mantine/core';
import { useMemo } from 'react';
import {
  MdArchive,
  MdBookmark,
  MdDelete,
  MdEdit,
  MdFolder,
  MdStar,
} from 'react-icons/md';
import { IoMdCalendar, IoMdCash, IoMdEye } from 'react-icons/io';
import PageContainer from '@/components/page/Container';

interface Advertisement {
  uid: string;
  title: string;
  description: string;
  pictures: [string, ...string[]];
  price: number;
  currency: string;
  location: string;
  publishedAt: Date;
  views: number;
  bookmarks: number;
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
    <Paper
      component="article"
      style={{ overflow: 'hidden' }}
      shadow="sm"
      withBorder
    >
      <SimpleGrid
        style={{ gridTemplateColumns: 'auto 1fr' }}
        p={0}
        align="flex-start"
      >
        <Image
          src={firstPicture}
          alt="Ad picture"
          maw="14rem"
          w="100%"
          m="md"
          mr={0}
          radius="lg"
          style={{ aspectRatio: 4 / 3 }}
        />
        <Stack py="md" gap="xs">
          <Group gap="xs">
            <Badge variant="light">
              <Text>{currencyFormatter.format(ad.price)}</Text>
            </Badge>
            <Text fz="lg">{ad.title}</Text>
          </Group>
          <Text fz="sm">{ad.location}</Text>
          <Group gap="xs" fz="sm" opacity={0.75}>
            <Group gap="0.25rem">
              {ad.publishedAt.toLocaleDateString()}
              <IoMdCalendar />
            </Group>
            <Group gap="0.25rem">
              {ad.views}
              <IoMdEye />
            </Group>
            <Group gap="0.25rem">
              {ad.bookmarks}
              <MdBookmark />
            </Group>
          </Group>
          <Group mt="auto" gap="xs">
            <Button rightSection={<IoMdCash />}>Sold</Button>
            <Button rightSection={<MdArchive />}>Reserve</Button>
            <Button rightSection={<MdDelete />}>Delete</Button>
          </Group>
        </Stack>
      </SimpleGrid>
    </Paper>
  );
}

export default function Dashboard() {
  const ads = Array(20)
    .fill(1)
    .map<Advertisement>((_, idx) => {
      return {
        uid: String(idx),
        title: 'Sample',
        description: 'Sample',
        pictures: ['/some-pic.jpg'],
        price: Math.round(Math.random() * 10000) * 0.01,
        currency: 'EUR',
        location: 'Gorinchem, Gelderland, Netherlands',
        publishedAt: new Date(),
        bookmarks: 10,
        views: 100,
      };
    });

  return (
    <PageContainer>
      <Stack gap="md">
        <Text component="h1" size="2rem">
          Seller dashboard
        </Text>
        <Tabs variant="pills" defaultValue="ads">
          <Stack gap="md">
            <Tabs.List>
              <Tabs.Tab value="ads" rightSection={<MdFolder />}>
                Advertisements
              </Tabs.Tab>
              <Tabs.Tab value="drafts" rightSection={<MdEdit />}>
                Drafts
              </Tabs.Tab>
              <Tabs.Tab value="reviews" rightSection={<MdStar />}>
                Reviews
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="ads">
              <Stack gap="md">
                {ads.map((ad) => (
                  <AdvertisementCard key={ad.uid} ad={ad} />
                ))}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="drafts">
              <Stack gap="md">
                {ads.map((ad) => (
                  <AdvertisementCard key={ad.uid} ad={ad} />
                ))}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="reviews">Reviews</Tabs.Panel>
          </Stack>
        </Tabs>
      </Stack>
    </PageContainer>
  );
}
