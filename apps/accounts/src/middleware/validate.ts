import Koa from 'koa';
import { RouterParamContext } from '@koa/router';
import z from 'zod';

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
    };
  } & RouterParamContext,
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
      };

      await next();

      if (!schemas.response) return;
      schemas.response.parse(ctx.body);
    } catch (err) {
      if (!(err instanceof z.ZodError)) throw err;
      return ctx.throw(422, err.toString());
    }
  };

export default validate;
