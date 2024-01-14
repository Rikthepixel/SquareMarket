import {
  Button,
  Collapse,
  Divider,
  Grid,
  Group,
  Select,
  Skeleton,
  Stack,
  TextInput,
} from '@mantine/core';
import { useEffect, useMemo } from 'react';
import { MdFilterAlt, MdSearch } from 'react-icons/md';
import PageContainer from '@/components/page/Container';
import useAdvertisements from '@/stores/useAdvertisements';
import { useDisclosure } from '@mantine/hooks';
import useCategories from '@/stores/useCategories';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import AdvertisementCard from './components/AdvertisementCard';
import SkeletonCard from './components/SkeletonCard';

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
  const { loadCategories, categories, loadCategory, resetCategory, category } =
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
    if (!selectedCategory || selectedCategory === 'none') {
      resetCategory();
      return setValues({ options: [] });
    }
    loadCategory(selectedCategory);
  }, [selectedCategory, resetCategory, loadCategory, setValues]);

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
    [categories],
  );

  const handleSubmit = useMemo(
    () =>
      onSubmit((data) => {
        getAdvertisementsWithFilter({
          search: data.search,
          category: data.category !== 'none' ? data.category : undefined,
          property_options: data.options
            ?.map((opt) => opt.value)
            .filter((opt) => opt !== 'none'),
        });
      }),
    [onSubmit, getAdvertisementsWithFilter],
  );

  return (
    <PageContainer>
      <Group justify="center">
        <TextInput
          {...getInputProps('search')}
          w={{ xs: '100%', sm: 'auto' }}
          style={{ flex: 1 }}
          size="md"
          placeholder="Search on title and description"
          rightSection={<MdSearch />}
        />
        <Button
          size="md"
          w={{ xs: 'auto' }}
          rightSection={<MdFilterAlt />}
          onClick={toggleFilter}
          fullWidth
        >
          Filters
        </Button>
        <Button
          size="md"
          w={{ xs: 'auto' }}
          rightSection={<MdSearch />}
          onClick={handleSubmit}
          fullWidth
        >
          Search
        </Button>
      </Group>

      {categoryOptions
        .map((options) => (
          <Collapse in={isFilterOpen}>
            <Stack gap="md" mt="md">
              <Divider />
              <Select
                {...getInputProps('category')}
                label="Category"
                defaultValue="none"
                data={options}
              />
              {category
                .map((cat) => (
                  <>
                    <Divider />
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
                  </>
                ))
                .catch((e) => e.message)
                .loading(() => (
                  <>
                    <Divider />
                    <Stack gap="xl" mt="sm">
                      {Array(3)
                        .fill(true)
                        .map((_, idx) => (
                          <Stack key={idx}>
                            <Skeleton width="15%" height="0.65em" />
                            <Skeleton height="1em" />
                          </Stack>
                        ))}
                    </Stack>
                  </>
                ))
                .unwrap()}
            </Stack>
          </Collapse>
        ))
        .catch((e) => e.message)
        .pending(() => null)
        .unwrap()}
      {advertisements
        .map((value) => {
          if (value.length === 0) {
            return 'There are no advertisements yet, be the first to place one!';
          }

          return (
            <Grid mt="md" pb="md">
              {value.map((ad) => (
                <Grid.Col key={ad.uid} span={{ xs: 12, sm: 6, lg: 4 }}>
                  <AdvertisementCard {...ad} />
                </Grid.Col>
              ))}
            </Grid>
          );
        })
        .pending(() => (
          <Grid mt="md" pb="md">
            {Array(10)
              .fill(true)
              .map((_, idx) => (
                <Grid.Col key={idx} span={{ xs: 12, sm: 6, lg: 4 }}>
                  <SkeletonCard />
                </Grid.Col>
              ))}
          </Grid>
        ))
        .catch((e) => e.message)
        .unwrap()}
    </PageContainer>
  );
}
