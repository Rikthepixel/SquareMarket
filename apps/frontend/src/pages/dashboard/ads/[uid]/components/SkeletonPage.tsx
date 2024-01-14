import { Carousel } from '@mantine/carousel';
import { AspectRatio, Paper, Skeleton, Stack } from '@mantine/core';

export default function SkeletonPage() {
  return (
    <Stack gap="lg">
      <Stack>
        <Skeleton w="2rem" h="1rem" />
        <Carousel
          w="100%"
          slideSize={{ base: '100%', sm: '50%', md: 'calc(100% / 3)' }}
          slideGap={{ base: 0, sm: 'md' }}
          align="start"
          withControls
          withIndicators
        >
          {Array(5)
            .fill(true)
            .map((_, idx) => (
              <Carousel.Slide key={idx}>
                <Paper h="100%" withBorder>
                  <AspectRatio ratio={4 / 3}>
                    <Skeleton w="100%" h="100%" />
                  </AspectRatio>
                </Paper>
              </Carousel.Slide>
            ))}
        </Carousel>
      </Stack>
      <Stack gap="sm">
        <Skeleton w="2rem" h="1rem" />
        <Skeleton w="100%" h="2rem" />
      </Stack>
      <Stack gap="sm">
        <Skeleton w="2rem" h="1rem" />
        <Skeleton w="100%" h="6rem" />
      </Stack>
      <Stack gap="sm">
        <Skeleton w="2rem" h="1rem" />
        <Skeleton w="100%" h="2rem" />
      </Stack>
      <Stack gap="sm">
        <Skeleton w="2rem" h="1rem" />
        <Skeleton w="100%" h="2rem" />
      </Stack>
      <Stack gap="sm">
        <Skeleton w="2rem" h="1rem" />
        <Skeleton w="100%" h="2rem" />
      </Stack>
    </Stack>
  );
}
