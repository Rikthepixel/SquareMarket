export interface PutAdvertisementRequest {
  title?: string | undefined | null;
  description?: string | undefined | null;
  price?: number | undefined | null;
  currency?: string | undefined | null;
  category?: string | undefined | null;
  published?: boolean | undefined | null;
  propertyValues?: Record<string, string> | undefined | null;
  images: string[];
}
