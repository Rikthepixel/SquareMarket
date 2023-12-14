import {
  Badge,
  Image,
  Text,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
} from '@mantine/core';
import { useMemo } from 'react';
import { IoMdCalendar } from 'react-icons/io';
import { MdDelete, MdDownload, MdEdit, MdPublish } from 'react-icons/md';
import { Link } from 'wouter';

interface Advertisement {
  uid: string;
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  published_at?: Date;
}

export default function AdvertisementCard({
  ad,
  draft,
}: {
  ad: Advertisement;
  draft: boolean;
}) {
  const currencyFormatter = useMemo(
    () =>
      ad.currency
        ? new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: ad.currency,
            notation: 'standard',
          })
        : null,
    [ad.currency],
  );

  const image: null | string = null;

  return (
    <Paper
      component="article"
      style={{ overflow: 'hidden' }}
      shadow="sm"
      withBorder
    >
      <SimpleGrid
        style={{ gridTemplateColumns: 'auto 1fr' }}
        spacing="md"
        p={0}
        align="flex-start"
      >
        <Image
          src={image ?? '/placeholder-ad-img.webp'}
          alt="Ad picture"
          maw="14rem"
          w="100%"
          m="md"
          mr={0}
          radius="lg"
          style={{ aspectRatio: 4 / 3 }}
        />
        <Stack py="md" gap="xs">
          {currencyFormatter && ad.price && (
            <Badge variant="light">
              <Text>{currencyFormatter.format(ad.price)}</Text>
            </Badge>
          )}
          <Text fz="lg">{ad.title ?? 'Unnamed advertisement'}</Text>
          <Text>
            {ad.description?.substring(
              0,
              Math.min(ad.description.length, 300),
            ) ?? 'Empty description'}
          </Text>
          <Group gap="xs" fz="sm" opacity={0.75}>
            {ad.published_at && (
              <Group gap="0.25rem">
                {ad.published_at.toLocaleDateString()}
                <IoMdCalendar />
              </Group>
            )}
          </Group>
          <Group mt="auto" gap="xs">
            <Link href={`/dashboard/ads/${ad.uid}`}>
              <Button rightSection={<MdEdit />} component="a">
                Edit
              </Button>
            </Link>
            {draft ? (
              <Button rightSection={<MdPublish />}>Publish</Button>
            ) : (
              <Button rightSection={<MdDownload />}>Unpublish</Button>
            )}
            <Button rightSection={<MdDelete />}>Delete</Button>
          </Group>
        </Stack>
      </SimpleGrid>
    </Paper>
  );
}
