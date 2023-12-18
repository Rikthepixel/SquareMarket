import {
  AspectRatio,
  Badge,
  Button,
  Card,
  Collapse,
  Grid,
  Group,
  Image,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useEffect, useMemo } from 'react';
import { MdFilterAlt, MdSearch } from 'react-icons/md';
import PageContainer from '@/components/page/Container';
import useAdvertisements from '@/stores/useAdvertisements';
import { Carousel } from '@mantine/carousel';
import { getImageUrl } from '@/apis/ads/images';
import { useDisclosure } from '@mantine/hooks';
import useCategories from '@/stores/useCategories';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';

interface AdvertisementCardProps {
  title: string;
  description: string;
  currency: string;
  price: number;
  images: string[];
}

function AdvertisementCard({
  images,
  title,
  description,
  price,
  currency,
}: AdvertisementCardProps) {
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency,
        notation: 'standard',
      }),
    [currency],
  );

  return (
    <Card component="article" radius="xl" shadow="sm" withBorder>
      <Card.Section>
        <Carousel
          w="100%"
          slideSize="100%"
          align="start"
          withControls
          withIndicators
        >
          {images.map((image, idx) => {
            return (
              <Carousel.Slide key={idx}>
                <AspectRatio ratio={4 / 3}>
                  <Image
                    key={idx}
                    src={getImageUrl(image)}
                    fallbackSrc="/placeholder-ad-img.webp"
                    radius="lg"
                  />
                </AspectRatio>
              </Carousel.Slide>
            );
          })}
        </Carousel>
      </Card.Section>
      <Stack gap="xs">
        <Group mt="md" gap="xs">
          <Badge variant="light">
            <Text>{currencyFormatter.format(price)}</Text>
          </Badge>
          <Text fz="lg">{title}</Text>
        </Group>
        <Text>
          {description.substring(0, Math.min(description.length, 300))}
        </Text>
      </Stack>
    </Card>
  );
}

const filterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  options: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
      }),
    )
    .optional(),
});

export default function FrontPage() {
  const [isFilterOpen, { toggle: toggleFilter }] = useDisclosure(false);
  const { advertisements, getAdvertisementsWithFilter } = useAdvertisements();
  const { loadCategories, categories, loadCategory, category } =
    useCategories();

  const {
    getInputProps,
    onSubmit,
    setValues,
    values: { category: selectedCategory },
  } = useForm<z.infer<typeof filterSchema>>({
    validate: zodResolver(filterSchema),
    validateInputOnChange: true,
  });

  useEffect(() => {
    getAdvertisementsWithFilter({});
    loadCategories();
  }, [getAdvertisementsWithFilter, loadCategories]);

  useEffect(() => {
    if (!selectedCategory || selectedCategory === 'none') return;
    loadCategory(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    category.map((category) =>
      setValues({
        options: category.properties.map((prop) => ({
          name: prop.name,
          value: 'none',
        })),
      }),
    );
  }, [category, setValues]);

  const categoryOptions = useMemo(
    () =>
      categories.map((cats) => [
        {
          label: 'None',
          value: 'none',
        },
        ...cats.map((cat) => ({ label: cat.name, value: cat.uid })),
      ]),
    [categories, getInputProps],
  );

  const handleSubmit = useMemo(
    () =>
      onSubmit(
        (data) => {
          getAdvertisementsWithFilter({
            ...data,
            property_options: data.options
              ?.map((opt) => opt.value)
              .filter((opt) => opt !== 'none'),
          });
        },
        (errors) => {
          console.log(errors);
        },
      ),
    [onSubmit],
  );

  return (
    <PageContainer>
      <Group justify="center">
        <TextInput
          {...getInputProps('search')}
          size="md"
          placeholder="Search on title and description"
          rightSection={<MdSearch />}
        />
        <Button size="md" rightSection={<MdFilterAlt />} onClick={toggleFilter}>
          Filters
        </Button>
        <Button size="md" rightSection={<MdSearch />} onClick={handleSubmit}>
          Search
        </Button>
      </Group>
      <Collapse in={isFilterOpen}>
        {categoryOptions
          .map((options) => (
            <Select
              {...getInputProps('category')}
              label="Category"
              defaultValue="none"
              data={options}
            />
          ))
          .mapError((e) => e.message)
          .mapPending(() => 'Loading categories...')
          .unwrap()}
        {category
          .map((cat) => (
            <Stack>
              {cat.properties.map((prop, idx) => (
                <Select
                  key={prop.uid}
                  label={prop.name}
                  defaultValue="none"
                  data={[
                    {
                      label: 'None',
                      value: 'none',
                    },
                    ...prop.options.map((opt) => ({
                      label: opt.name,
                      value: opt.uid,
                    })),
                  ]}
                  {...getInputProps(`options.${idx}.value`)}
                />
              ))}
            </Stack>
          ))
          .mapError((e) => e.message)
          .mapLoading(() => 'Loading category properties...')
          .unwrap()}
      </Collapse>
      <Grid mt="md" pb="md">
        {advertisements
          .map((value) =>
            value.map((ad) => (
              <Grid.Col key={ad.uid} span={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <AdvertisementCard {...ad} />
              </Grid.Col>
            )),
          )
          .mapError((e) => e.message)
          .unwrap()}
      </Grid>
    </PageContainer>
  );
}
