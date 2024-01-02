export interface PutAdvertisementRequest {
  title?: string | undefined;
  description?: string | undefined;
  price?: number | undefined;
  currency?: string | undefined;
  category?: string | undefined;
  published?: boolean | undefined;
  propertyValues?: Record<string, string> | undefined;
  images: string[];
}
