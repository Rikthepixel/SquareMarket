import { Carousel } from '@mantine/carousel';
import {
  AspectRatio,
  Paper,
  Image,
  ActionIcon,
  CloseIcon,
} from '@mantine/core';

interface ImageSlideProps {
  src: string;
  onLoad?: () => void;
  onDelete?: () => void;
}

export default function ImageSlide(props: ImageSlideProps) {
  return (
    <Carousel.Slide>
      <Paper h="100%" pos="relative" withBorder>
        <AspectRatio ratio={4 / 3}>
          <Image
            src={props.src}
            radius="lg"
            onLoad={props.onLoad}
            fallbackSrc="/placeholder-ad-img.webp"
          />
        </AspectRatio>
        <ActionIcon pos="absolute" top={4} right={4} onClick={props.onDelete}>
          <CloseIcon />
        </ActionIcon>
      </Paper>
    </Carousel.Slide>
  );
}
