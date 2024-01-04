import { getImageUrl } from '@/apis/ads/images';
import { Carousel } from '@mantine/carousel';
import {
  AspectRatio,
  Badge,
  Card,
  Image,
  Paper,
  Stack,
  Text,
} from '@mantine/core';
import { Link } from 'wouter';
import carouselClasses from './index.carousel.module.css';
import styles from './index.module.css';
import useCurrencyFormatter from '@/hooks/useCurrencyFormatter';

export interface AdvertisementCardProps {
  uid: string;
  title: string;
  description: string;
  currency: string;
  price: number;
  images: string[];
}

function AdvertisementCard({
  uid,
  images,
  title,
  description,
  price,
  currency,
}: AdvertisementCardProps) {
  const currencyFormatter = useCurrencyFormatter(currency);

  return (
    <Card
      component="article"
      radius="lg"
      shadow="sm"
      pos="relative"
      withBorder
      className={styles.card}
    >
      <Card.Section>
        <Carousel
          w="100%"
          slideSize="100%"
          align="start"
          withControls
          withIndicators
          classNames={carouselClasses}
        >
          {images.map((image, idx) => {
            return (
              <Carousel.Slide key={idx}>
                <AspectRatio ratio={4 / 3}>
                  <Link href={`/ads/${uid}`}>
                    <Image
                      key={idx}
                      src={getImageUrl(image)}
                      fallbackSrc="/placeholder-ad-img.webp"
                      radius="lg"
                    />
                  </Link>
                </AspectRatio>
              </Carousel.Slide>
            );
          })}
        </Carousel>
        <Badge variant="white" pos="absolute" top={12} left={12}>
          <Text>{currencyFormatter.format(price)}</Text>
        </Badge>
        <Paper
          classNames={{ root: styles.info_paper }}
          w="100%"
          pos="absolute"
          bottom={0}
          p="xs"
          pb="sm"
          shadow="lg"
          radius="0"
          bg="#00000050"
        >
          <Stack gap="xs">
            <Text fz="lg" color="white">
              {title}
            </Text>
            <Text truncate="end" color="white">
              {description.substring(0, Math.min(description.length, 300))}
            </Text>
          </Stack>
        </Paper>
      </Card.Section>
    </Card>
  );
}

export default AdvertisementCard;
