import PageContainer from '@/components/page/Container';
import {
  Button,
  Divider,
  Group,
  NumberInput,
  Select,
  Stack,
  Switch,
  TextInput,
  Textarea,
  Text,
  rem,
  Image,
  Paper,
  AspectRatio,
  ActionIcon,
  CloseIcon,
  ComboboxItem,
} from '@mantine/core';
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { Carousel } from '@mantine/carousel';
import { MdAttachMoney, MdEuro, MdPhoto, MdSave } from 'react-icons/md';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useAdvertisementEditor from '@/stores/useAdvertisementEditor';
import useTypedParams from '@/hooks/useTypedParams';
import { z } from 'zod';
import { useForm, zodResolver } from '@mantine/form';
import { IoMdCash } from 'react-icons/io';
import useCategories from '@/stores/useCategories';

const VALID_CURRENCIES = ['EUR', 'USD'] as const;

const CURRENCY_ICON_MAP = {
  EUR: <MdEuro />,
  USD: <MdAttachMoney />,
} satisfies Record<(typeof VALID_CURRENCIES)[number], JSX.Element>;

const PARAMS_SCHEMA = z.object({
  uid: z.string(),
});

const FORM_SCHEMA = z.union([
  z.object({
    title: z.string(),
    description: z.string(),
    price: z.number(),
    currency: z.enum(VALID_CURRENCIES),
    category: z.string(),
    published: z.literal(true),
  }),
  z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    currency: z.enum(VALID_CURRENCIES).optional(),
    category: z.string().optional(),
    published: z.literal(false),
  }),
]);

type FormSchema = z.infer<typeof FORM_SCHEMA>;

export default function EditAdPage() {
  const [images, setImages] = useState<FileWithPath[]>([]);
  const { uid } = useTypedParams(PARAMS_SCHEMA) ?? {};
  const { loadCategories, loadCategory, categories, category } =
    useCategories();
  const { load, advertisement } = useAdvertisementEditor();

  const {
    getInputProps,
    onSubmit,
    values: { published, currency },
    setValues,
  } = useForm<FormSchema>({
    validate: zodResolver(FORM_SCHEMA),
    validateInputOnChange: true,
  });

  useEffect(() => {
    if (!uid) return;
    load(uid);
  }, [load]);

  useEffect(() => {
    advertisement.then((ad) => {
      if (!ad.category?.uid) return;
      loadCategory(ad.category.uid);
    });
  }, [advertisement]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const ad = advertisement.unwrapValue();
    if (!ad) return;

    setValues({
      title: ad.title,
      description: ad.description,
      price: ad.price,
      currency: ad.currency as 'EUR' | 'USD' | undefined,
      category: ad.category?.uid,
      published: ad.published_at !== null,
    });
  }, [setValues, advertisement]);

  const onSave = useMemo(() => onSubmit((data) => {}), []);

  const currencyOptions = useMemo<ComboboxItem[]>(() => {
    return [
      {
        label: 'Select a currency',
        value: 'none',
        disabled: true,
      },
      ...VALID_CURRENCIES.map((c) => ({ label: c, value: c })),
    ];
  }, []);

  return (
    <PageContainer>
      <Stack gap="md">
        <Carousel
          w="100%"
          slideSize={{ base: '100%', sm: '50%', md: 'calc(100% / 3)' }}
          slideGap={{ base: 0, sm: 'md' }}
          align="start"
          withControls
          withIndicators
        >
          <Carousel.Slide>
            <Paper h="100%" withBorder>
              <AspectRatio ratio={4 / 3}>
                <Dropzone
                  onDrop={(newImages) =>
                    setImages((current) => [...newImages, ...current])
                  }
                  onReject={(files) => console.log('rejected files', files)}
                  maxSize={3 * 1024 ** 2}
                  accept={IMAGE_MIME_TYPE}
                  p="md"
                  multiple
                >
                  <Group
                    justify="center"
                    gap="md"
                    style={{ pointerEvents: 'none' }}
                  >
                    <MdPhoto
                      style={{
                        width: rem(52),
                        height: rem(52),
                      }}
                      stroke={1.5}
                    />
                    <Stack gap="md">
                      <Text size="xl" inline>
                        Drag images here or click to select files
                      </Text>
                      <Text size="sm" c="dimmed" inline>
                        Attach as many files as you like, each file should not
                        exceed 5mb
                      </Text>
                    </Stack>
                  </Group>
                </Dropzone>
              </AspectRatio>
            </Paper>
          </Carousel.Slide>
          {images.map((image, idx) => {
            const imageUrl = URL.createObjectURL(image);

            return (
              <Carousel.Slide key={idx}>
                <Paper h="100%" pos="relative" withBorder>
                  <AspectRatio ratio={4 / 3}>
                    <Image
                      key={idx}
                      src={imageUrl}
                      radius="lg"
                      onLoad={() => URL.revokeObjectURL(imageUrl)}
                    />
                  </AspectRatio>
                  <ActionIcon
                    pos="absolute"
                    top={4}
                    right={4}
                    onClick={() =>
                      setImages((current) => {
                        const newImages = [...current];
                        const imageIdx = newImages.findIndex(
                          (_image) => _image === image,
                        );
                        if (imageIdx === -1) return current;
                        newImages.splice(imageIdx, 1);
                        return newImages;
                      })
                    }
                  >
                    <CloseIcon />
                  </ActionIcon>
                </Paper>
              </Carousel.Slide>
            );
          })}
        </Carousel>
        <TextInput
          {...getInputProps('title')}
          placeholder="Title of your advertisement..."
          label="Title"
          withAsterisk={published}
        />
        <Textarea
          {...getInputProps('description')}
          placeholder="Describe the item(s) you are selling"
          label="Description"
          minRows={4}
          autosize
          withAsterisk={published}
        />
        <Select
          {...getInputProps('currency')}
          label="Currency"
          value="none"
          data={currencyOptions}
          withAsterisk={published}
        />
        <NumberInput
          {...getInputProps('price')}
          label="Price"
          placeholder="The price you want to sell the item(s) at"
          value={10.0}
          fixedDecimalScale
          decimalScale={2}
          leftSection={
            currency ? (
              CURRENCY_ICON_MAP[currency] ?? <IoMdCash />
            ) : (
              <IoMdCash />
            )
          }
          withAsterisk={published}
        />
        <Divider />
        {categories
          .then((cats) => (
            <Select
              {...getInputProps('category')}
              label="Category"
              data={cats.map((cat) => ({
                label: cat.name,
                value: cat.uid,
              }))}
              withAsterisk={published}
            />
          ))
          .catch(() => 'An error occurred while loading the categories...')
          .pending(() => 'Loading categories...')
          .unwrap()}

        {category
          .then((cat) => {
            const defaultProperties = advertisement
              .then((ad) => ad.propertyValues)
              .unwrapValue();

            return (
              <Stack>
                {cat.properties.map((prop, idx) => (
                  <Select
                    key={prop.uid}
                    label={prop.name}
                    defaultValue={
                      defaultProperties?.find(
                        (prop) => prop.category_property_uid === prop.uid,
                      )?.uid ?? 'none'
                    }
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
            );
          })
          .catch((e) => e.message)
          .loading(() => 'Loading category properties...')
          .unwrap()}

        <Divider />
        <Switch {...getInputProps('published')} label="Published" />
        <Button w="fit-content" rightSection={<MdSave />}>
          Save
        </Button>
      </Stack>
    </PageContainer>
  );
}
