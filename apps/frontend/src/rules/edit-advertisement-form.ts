import { z } from 'zod';
import editDraftAdvertisementSchema, {
  EditDraftAdvertisementSchema,
} from './edit-draft-advertisement-form';
import editPublishedAdvertisementFormSchema, {
  EditPublishedAdvertisementSchema,
} from './edit-published-advertisement-form';

export type EditAdvertisementSchema =
  | EditPublishedAdvertisementSchema
  | EditDraftAdvertisementSchema;

const editAdvertisementSchema = z
  .object({ published: z.boolean() })
  .passthrough()
  .superRefine((data, ctx): data is EditAdvertisementSchema => {
    const result = data.published
      ? editPublishedAdvertisementFormSchema.safeParse(data)
      : editDraftAdvertisementSchema.safeParse(data);

    if (result.success) return true;
    result.error.issues.forEach((iss) => ctx.addIssue(iss));
    return false;
  });

export default editAdvertisementSchema;
