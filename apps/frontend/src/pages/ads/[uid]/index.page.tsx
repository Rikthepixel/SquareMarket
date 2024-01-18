import { getImageUrl } from '@/apis/ads/images';
import PageContainer from '@/components/page/Container';
import useCurrencyFormatter from '@/hooks/useCurrencyFormatter';
import useTypedParams from '@/hooks/useTypedParams';
import useAuth from '@/lib/auth/stores/useAuth';
import useAdvertisements from '@/stores/useAdvertisements';
import useChats from '@/stores/useChats';
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
  Skeleton,
  Button,
} from '@mantine/core';
import { useEffect } from 'react';
import { MdMessage, MdPerson } from 'react-icons/md';
import { useLocation } from 'wouter';
import { z } from 'zod';

const PARAMS_SCHEMA = z.object({
  uid: z.string().uuid(),
});

export default function AdPage() {
  const { uid } = useTypedParams(PARAMS_SCHEMA) ?? {};
  const { advertisement, getAdvertisement } = useAdvertisements();
  const { startChat } = useChats();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

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
              {user && advertisement.user.uid !== user.providerId && (
                <Button
                  onClick={() =>
                    startChat(advertisement.user.uid).then((uid) =>
                      setLocation(`/messages/${uid}`),
                    )
                  }
                >
                  <Group gap="sm">
                    <MdMessage />
                    Contact seller
                  </Group>
                </Button>
              )}
            </Stack>
            <Stack gap="sm">
              <Text fz="sm" fw={700}>
                Description
              </Text>
              <Text style={{ whiteSpace: 'pre-wrap' }}>
                {advertisement.description}
              </Text>
            </Stack>
            {advertisement.propertyValues.length > 0 && (
              <>
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
                          <Text
                            style={{
                              whiteSpace: 'break-spaces',
                              wordBreak: 'break-word',
                            }}
                            fw={700}
                          >
                            {value.property_name}
                          </Text>
                          <Text
                            style={{
                              whiteSpace: 'break-spaces',
                              wordBreak: 'break-word',
                            }}
                          >
                            {value.option_name}
                          </Text>
                        </SimpleGrid>
                      </Paper>
                    ))}
                  </Paper>
                </Stack>
              </>
            )}
          </Stack>
        ))
        .pending(() => (
          <Stack gap="md">
            <Carousel
              w="100%"
              slideSize={{ base: '100%', sm: '50%' }}
              slideGap={{ base: 0, sm: 'md' }}
              align="start"
            >
              {Array(3)
                .fill(true)
                .map((_, idx) => (
                  <Carousel.Slide key={idx}>
                    <AspectRatio ratio={4 / 3}>
                      <Skeleton height="100%" />
                    </AspectRatio>
                  </Carousel.Slide>
                ))}
            </Carousel>
            <Stack gap="sm">
              <Skeleton height="1.5em" />
              <Skeleton width="15%" />
            </Stack>
            <Stack gap="sm">
              <Skeleton width="15%" />
              <Skeleton height="10rem" />
            </Stack>
            <Stack gap="sm">
              <Skeleton width="15%" />
              <Skeleton height="15rem" />
            </Stack>
          </Stack>
        ))
        .catch((err) => err.message)
        .unwrap()}
    </PageContainer>
  );
}
