import { IoMdCash } from 'react-icons/io';
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
  Paper,
  AspectRatio,
  ComboboxItem,
  Input,
} from '@mantine/core';
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { Carousel } from '@mantine/carousel';
import { MdAttachMoney, MdEuro, MdPhoto, MdSave } from 'react-icons/md';
import { useEffect } from 'react';
import { useForm, zodResolver } from '@mantine/form';
import PageContainer from '@/components/page/Container';
import useAdvertisementEditor, {
  EditedAdvertisement,
} from '@/stores/useAdvertisementEditor';
import editAdvertisementSchema, {
  EditAdvertisementSchema,
} from '@/rules/edit-advertisement-form';

import useTypedParams from '@/hooks/useTypedParams';

import { z } from 'zod';
import useCategories from '@/stores/useCategories';
import ImageSlide from './components/ImageSlide';
import { VALID_CURRENCIES } from '@/configs/advertisements';
import { getImageUrl } from '@/apis/ads/images';
import ArrayUtils from '@/helpers/Array';

const CURRENCY_OPTIONS: ComboboxItem[] = [
  {
    label: 'Select a currency',
    value: 'none',
    disabled: true,
  },
  ...VALID_CURRENCIES.map((c) => ({ label: c, value: c })),
];

const CURRENCY_ICON_MAP = {
  EUR: <MdEuro />,
  USD: <MdAttachMoney />,
  none: <IoMdCash />,
} satisfies Record<(typeof VALID_CURRENCIES)[number] | 'none', JSX.Element>;

const PARAMS_SCHEMA = z.object({
  uid: z.string(),
});

export default function EditAdPage() {
  const { uid } = useTypedParams(PARAMS_SCHEMA) ?? {};

  const { loadCategories, loadCategory, resetCategory, categories, category } =
    useCategories();
  const {
    advertisement,
    edited,
    setEdited,
    resetEdited,
    load: loadAdvertisement,
    save: saveAdvertisement,
  } = useAdvertisementEditor();

  const {
    getInputProps,
    setValues,
    onSubmit: makeSubmitHandler,
    values,
    errors,
  } = useForm<EditAdvertisementSchema>({
    validate: zodResolver(editAdvertisementSchema),
    validateInputOnChange: true,
    initialValues: {
      options: {},
      published: false,
      images: [],
    },
  });

  useEffect(() => {
    if (!uid) return;
    loadAdvertisement(uid);
    loadCategories();
  }, [loadAdvertisement, loadCategories]);

  useEffect(() => {
    advertisement.map((ad) => {
      if (ad.category?.uid) {
        loadCategory(ad.category.uid);
      }

      resetEdited();
      setEdited({
        title: ad.title,
        description: ad.description,
        price: ad.price,
        currency: ad.currency as 'EUR' | 'USD' | undefined,
        category: ad.category?.uid,
        propertyValues: Object.fromEntries(
          ad.propertyValues.map((propValue) => [
            propValue.category_property_uid,
            propValue.category_property_option_uid,
          ]),
        ),
        images: ad.images,
        imagesToUpload: [],
        published: ad.published_at !== null,
      });

      setValues({
        title: ad.title,
        description: ad.description,
        price: ad.price,
        currency: (ad.currency as 'EUR' | 'USD' | undefined) ?? 'none',
        category: ad.category?.uid ?? 'none',
        published: ad.published_at !== null,
        images: ad.images,
      } as EditAdvertisementSchema);
    });
  }, [setValues, advertisement]);

  useEffect(() => {
    const ad = advertisement.unwrapValue();
    const cat = category.unwrapValue();
    if (!ad || !cat) return;

    setValues({
      options: Object.fromEntries(
        cat.properties.map((prop) => [
          prop.uid,
          {
            value:
              ad.propertyValues.find(
                (val) => val.category_property_uid === prop.uid,
              )?.category_property_option_uid ?? 'none',
          },
        ]),
      ),
    });
  }, [category, advertisement]);

  useEffect(() => {
    if (values.category && values.category !== 'none') {
      loadCategory(values.category);
      if (advertisement.unwrapValue()) {
        setEdited({
          category: values.category,
          propertyValues: {},
        });
      }
    } else {
      resetCategory();
    }
  }, [values.category, advertisement, loadCategory, resetCategory]);

  useEffect(() => {
    setValues({
      images: [
        ...edited.images,
        ...edited.imagesToUpload.map(
          (file) => `${file.size}${file.path}${file.name}${file.type}`,
        ),
      ],
    });
  }, [setValues, edited.images, edited.imagesToUpload]);

  const onSubmit = makeSubmitHandler(async (data) => {
    const propertyValues: Record<string, string> = {};
    for (const [key, option] of Object.entries(data.options)) {
      if (
        option.value === 'none' ||
        option.value === undefined ||
        option.value === null
      ) {
        continue;
      }

      propertyValues[key] = option.value;
    }

    const edited = {
      ...(data as Partial<typeof data>),
      category: data.category === 'none' ? undefined : data.category,
      currency: data.currency === 'none' ? undefined : data.currency,
      propertyValues,
    } satisfies Partial<EditedAdvertisement>;

    delete edited.options;
    delete edited.images;

    setEdited(edited);
    await saveAdvertisement();
  });

  const onImagesAdded = (newImages: FileWithPath[]) => {
    setEdited({
      imagesToUpload: [...edited.imagesToUpload, ...newImages],
    });
  };

  const makeOnUploadedImageRemoved = (imgToRemove: string) =>
    function () {
      setEdited({
        images: ArrayUtils.toSpliced(
          edited.images,
          (img) => img === imgToRemove,
        ),
      });
    };

  const makeOnImageRemoved = (imgToRemove: FileWithPath) =>
    function () {
      setEdited({
        imagesToUpload: ArrayUtils.toSpliced(
          edited.imagesToUpload,
          (img) => img === imgToRemove,
        ),
      });
    };

  return (
    <PageContainer>
      {advertisement
        .map(() => (
          <form onSubmit={onSubmit}>
            <Stack gap="md">
              <Input.Wrapper label="Images" error={errors.images}>
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
                          onDrop={onImagesAdded}
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
                                Attach as many files as you like, each file
                                should not exceed 5mb
                              </Text>
                            </Stack>
                          </Group>
                        </Dropzone>
                      </AspectRatio>
                    </Paper>
                  </Carousel.Slide>
                  {edited.imagesToUpload.map((image) => {
                    const imageUrl = URL.createObjectURL(image);
                    return (
                      <ImageSlide
                        key={`${image.path}-${image.name}-${image.size}`}
                        src={imageUrl}
                        onLoad={() => URL.revokeObjectURL(imageUrl)}
                        onDelete={makeOnImageRemoved(image)}
                      />
                    );
                  })}
                  {edited.images.map((imageUid) => (
                    <ImageSlide
                      key={`uuid-${imageUid}`}
                      src={getImageUrl(imageUid)}
                      onDelete={makeOnUploadedImageRemoved(imageUid)}
                    />
                  ))}
                </Carousel>
              </Input.Wrapper>
              <TextInput
                {...getInputProps('title')}
                placeholder="Title of your advertisement..."
                label="Title"
                withAsterisk={values.published}
              />
              <Textarea
                {...getInputProps('description')}
                placeholder="Describe the item(s) you are selling"
                label="Description"
                minRows={4}
                autosize
                withAsterisk={values.published}
              />
              <Select
                {...getInputProps('currency')}
                label="Currency"
                data={CURRENCY_OPTIONS}
                withAsterisk={values.published}
              />
              <NumberInput
                {...getInputProps('price')}
                label="Price"
                placeholder="The price you want to sell the item(s) at"
                fixedDecimalScale
                decimalScale={2}
                leftSection={
                  CURRENCY_ICON_MAP[values.currency ?? 'none'] ?? <IoMdCash />
                }
                withAsterisk={values.published}
              />
              <Divider />
              {categories
                .map((categories) => (
                  <Select
                    {...getInputProps('category')}
                    label="Category"
                    data={[
                      {
                        label: 'None',
                        value: 'none',
                      },
                      ...categories.map((cat) => ({
                        label: cat.name,
                        value: cat.uid,
                      })),
                    ]}
                    withAsterisk={values.published}
                  />
                ))
                .catch(
                  () => 'An error occurred while loading the categories...',
                )
                .pending(() => 'Loading categories...')
                .unwrap()}

              {category
                .map((category) => {
                  return (
                    <Stack>
                      {category.properties.map((prop) => (
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
                          {...getInputProps(`options.${prop.uid}.value`)}
                        />
                      ))}
                    </Stack>
                  );
                })
                .catch((e) => e.message)
                .loading(() => 'Loading category properties...')
                .unwrap()}

              <Divider />
              <Switch
                {...getInputProps('published', { type: 'checkbox' })}
                label="Published"
              />
              <Button w="fit-content" rightSection={<MdSave />} type="submit">
                Save
              </Button>
            </Stack>
          </form>
        ))
        .catch((e) => e.message)
        .loading(() => 'Loading advertisement...')
        .unwrap()}
    </PageContainer>
  );
}
