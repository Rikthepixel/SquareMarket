import corsMake from '@koa/cors';

const cors = corsMake({
  origin(ctx) {
    const allowedOrigins = [];

    if (process.env.ALLOWED_ORIGIN)
      allowedOrigins.push(process.env.ALLOWED_ORIGIN);
    if (process.env.NODE_ENV === 'development')
      allowedOrigins.push('http://localhost:5200');

    if (!allowedOrigins.includes(ctx.origin)) return '';

    return ctx.origin;
  },
});

export default cors;
