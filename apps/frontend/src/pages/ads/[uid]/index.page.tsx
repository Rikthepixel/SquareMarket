import { getImageUrl } from '@/apis/ads/images';
import PageContainer from '@/components/page/Container';
import useCurrencyFormatter from '@/hooks/useCurrencyFormatter';
import useTypedParams from '@/hooks/useTypedParams';
import useAdvertisements from '@/stores/useAdvertisements';
import { Carousel } from '@mantine/carousel';
import {
  Image,
  AspectRatio,
  Paper,
  Text,
  Badge,
  Stack,
  Group,
  SimpleGrid,
} from '@mantine/core';
import { useEffect } from 'react';
import { MdPerson } from 'react-icons/md';
import { z } from 'zod';

const PARAMS_SCHEMA = z.object({
  uid: z.string().uuid(),
});

export default function AdPage() {
  const { uid } = useTypedParams(PARAMS_SCHEMA) ?? {};
  const { advertisement, getAdvertisement } = useAdvertisements();
  const currencyFormatter = useCurrencyFormatter(
    advertisement.unwrapValue()?.currency ?? 'EUR',
  );

  useEffect(() => {
    if (!uid) return;
    getAdvertisement(uid);
  }, [getAdvertisement, uid]);

  return (
    <PageContainer maw="1000px">
      {advertisement
        .map((advertisement) => (
          <Stack gap="md">
            <Carousel
              w="100%"
              slideSize={{ base: '100%', sm: '50%' }}
              slideGap={{ base: 0, sm: 'md' }}
              align="start"
              withControls
              withIndicators
            >
              {advertisement.images.map((img, idx) => (
                <Carousel.Slide key={idx}>
                  <Paper h="100%" pos="relative" withBorder>
                    <AspectRatio ratio={4 / 3}>
                      <Image
                        src={getImageUrl(img)}
                        radius="lg"
                        fallbackSrc="/placeholder-ad-img.webp"
                      />
                    </AspectRatio>
                  </Paper>
                </Carousel.Slide>
              ))}
            </Carousel>
            <Stack gap="sm">
              <Group>
                <Badge size="xl">
                  {currencyFormatter.format(advertisement.price)}
                </Badge>
                <Text component="h1" fz="2rem" fw={600}>
                  {advertisement.title}
                </Text>
              </Group>
              <Group gap="sm" fz="md">
                <MdPerson />
                <Text>{advertisement.user.name}</Text>
              </Group>
            </Stack>
            <Stack gap="sm">
              <Text fz="sm" fw={700}>
                Description
              </Text>
              <Text style={{ whiteSpace: 'pre' }}>
                {advertisement.description}
              </Text>
            </Stack>
            <Stack gap="sm">
              <Text fz="sm" fw={700}>
                Properties
              </Text>
              <Paper style={{ overflow: 'hidden' }} radius="md" withBorder>
                {advertisement.propertyValues.map((value, idx) => (
                  <Paper
                    key={idx}
                    bg={idx % 2 === 1 ? 'transparent' : '#eeeeee'}
                    radius={0}
                    p="xs"
                  >
                    <SimpleGrid cols={2}>
                      <Text fw={700}>{value.property_name}</Text>
                      <Text>{value.option_name}</Text>
                    </SimpleGrid>
                  </Paper>
                ))}
              </Paper>
            </Stack>
          </Stack>
        ))
        .pending(() => 'Loading advertisement...')
        .catch((err) => err.message)
        .unwrap()}
    </PageContainer>
  );
}
