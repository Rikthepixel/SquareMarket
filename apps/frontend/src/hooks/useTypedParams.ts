import { useMemo } from 'react';
import { useParams } from 'wouter';
import { z } from 'zod';

export default function useTypedParams<TSchema extends z.ZodObject<{}>>(
  schema: TSchema,
): z.infer<typeof schema> | null {
  const params = useParams();
  return useMemo(() => {
    const result = schema.safeParse(params);
    if (!result.success) return null;
    return result.data;
  }, [params, schema]);
}
