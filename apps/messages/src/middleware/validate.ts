import Koa from 'koa';
import { RouterParamContext } from '@koa/router';
import z from 'zod';
import { validateBufferMIMEType } from 'validate-image-type';
import multer from '@koa/multer';

type InferSchema<TSchema extends z.ZodType | undefined | unknown> =
  TSchema extends z.ZodType
    ? z.infer<TSchema>
    : TSchema extends unknown
      ? undefined
      : undefined;

type ZodMiddleware<TSchemas extends PropSchemas> = Koa.Middleware<
  Koa.DefaultState,
  {
    validated: {
      query: InferSchema<TSchemas['query']>;
      params: InferSchema<TSchemas['params']>;
      headers: InferSchema<TSchemas['headers']>;
      body: InferSchema<TSchemas['body']>;
      images: multer.File[];
    };
  } & RouterParamContext &
    Koa.DefaultContext,
  InferSchema<
    TSchemas['response'] extends z.ZodType ? TSchemas['response'] : z.ZodTypeAny
  >
>;

interface PropSchemas<
  THeaders extends z.ZodType = z.ZodType,
  TBody extends z.ZodType = z.ZodType,
  TParams extends z.ZodType = z.ZodType,
  TQuery extends z.ZodType = z.ZodType,
  TResponse extends z.ZodType = z.ZodType,
> {
  headers?: THeaders;
  body?: TBody;
  params?: TParams;
  query?: TQuery;
  response?: TResponse;
  images?: { field: string; types: string[] }[];
}

const validate =
  <TSchemas extends PropSchemas = PropSchemas>(
    schemas: TSchemas,
  ): ZodMiddleware<TSchemas> =>
  async (ctx, next) => {
    try {
      ctx.validated = {
        body: schemas.body?.parse(ctx.request.body),
        headers: schemas.headers?.parse(ctx.request.headers),
        query: schemas.query?.parse(ctx.request.query),
        params: schemas.params?.parse(ctx.params),
        images: [],
      };

      if (ctx.files && schemas.images) {
        const files = Array.isArray(ctx.files)
          ? ctx.files
          : Object.values(ctx.files).flatMap((f) => f);

        for (const file of files) {
          const validatorField = schemas.images.find(
            (validatorField) => validatorField.field === file.fieldname,
          );
          if (!validatorField) continue;
          const result = await validateBufferMIMEType(file.buffer, {
            originalFilename: file.originalname,
            allowMimeTypes: validatorField.types,
          });

          if (!result.ok) continue;
          ctx.validated.images.push(file);
        }
      }
    } catch (err) {
      if (!(err instanceof z.ZodError)) throw err;
      return ctx.throw(422, err.toString());
    }

    await next();
  };

export default validate;
