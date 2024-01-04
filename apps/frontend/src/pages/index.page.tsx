import {
  Button,
  Collapse,
  Grid,
  Group,
  Select,
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
      setValues({ options: [] });
      return;
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
      onSubmit(
        (data) => {
          getAdvertisementsWithFilter({
            search: data.search,
            category: data.category !== 'none' ? data.category : undefined,
            property_options: data.options
              ?.map((opt) => opt.value)
              .filter((opt) => opt !== 'none'),
          });
        },
        (errors) => {
          console.log(errors);
        },
      ),
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
          .catch((e) => e.message)
          .pending(() => 'Loading categories...')
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
          .catch((e) => e.message)
          .loading(() => 'Loading category properties...')
          .unwrap()}
      </Collapse>
      <Grid mt="md" pb="md">
        {advertisements
          .map((value) =>
            value.length === 0
              ? 'There are no advertisements yet, be the first to place one!'
              : value.map((ad) => (
                  <Grid.Col key={ad.uid} span={{ xs: 12, sm: 6, lg: 4 }}>
                    <AdvertisementCard {...ad} />
                  </Grid.Col>
                )),
          )
          .catch((e) => e.message)
          .unwrap()}
      </Grid>
    </PageContainer>
  );
}
