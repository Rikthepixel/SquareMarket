import makeCors, { CorsOptions as MakeCorsOptions } from 'cors';

export interface CorsOptions extends Omit<MakeCorsOptions, 'origin'> {
  origin?: string | (string | undefined)[];
}

const cors = ({ origin, ...opts }: CorsOptions = {}) => {
  const whitelistedOrigins = Array.isArray(origin)
    ? (origin.filter((org) => Boolean(org)) as string[]).map((org) => org.trim())
    : typeof origin === 'string'
      ? [origin.trim()]
      : undefined;

  return makeCors({
    origin(reqOrigin, callback) {
      const verdict =
        whitelistedOrigins &&
        reqOrigin &&
        whitelistedOrigins.includes(reqOrigin.trim());

      callback(null, verdict);
    },
    ...opts,
  });
};

export default cors;
