import { getImageUrl } from '@/apis/ads/images';
import { deleteAdvertisement, unpublishAdvertisement } from '@/apis/ads/manage';
import useCurrencyFormatter from '@/hooks/useCurrencyFormatter';
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
import { IoMdCalendar } from 'react-icons/io';
import { MdDelete, MdDownload, MdEdit } from 'react-icons/md';
import { Link } from 'wouter';

interface Advertisement {
  uid: string;
  images: string[];
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  published_at?: Date;
}

export default function AdvertisementCard({
  ad,
  draft,
  onDeleted,
  onUnpublished,
}: {
  ad: Advertisement;
  draft: boolean;
  onUnpublished?: () => void;
  onDeleted: () => void;
}) {
  const currencyFormatter = useCurrencyFormatter(ad.currency ?? 'EUR');

  const unpublishAd = () => unpublishAdvertisement(ad.uid).then(onDeleted);
  const deleteAd = () => deleteAdvertisement(ad.uid).then(onUnpublished);

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
          src={ad.images.at(0) ? getImageUrl(ad.images.at(0)!) : null}
          fallbackSrc="/placeholder-ad-img.webp"
          alt="Ad picture"
          maw="14rem"
          w="100%"
          m="md"
          mr={0}
          radius="lg"
          style={{ aspectRatio: 4 / 3 }}
        />
        <Stack py="md" gap="xs">
          {ad.currency && ad.price && (
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
            {!draft && (
              <Button rightSection={<MdDownload />} onClick={unpublishAd}>
                Unpublish
              </Button>
            )}
            <Button rightSection={<MdDelete />} onClick={deleteAd}>
              Delete
            </Button>
          </Group>
        </Stack>
      </SimpleGrid>
    </Paper>
  );
}
