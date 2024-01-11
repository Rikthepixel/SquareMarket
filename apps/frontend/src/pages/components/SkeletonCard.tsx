import { AspectRatio, Skeleton } from "@mantine/core";

export default function SkeletonCard() {
  return (
    <AspectRatio ratio={4 / 3}>
      <Skeleton height="100%" />
    </AspectRatio>
  );
}
