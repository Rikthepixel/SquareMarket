export type FilteredAdvertisementsResponse = {
  uid: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  currency: string;
  published_at: Date;
}[];
