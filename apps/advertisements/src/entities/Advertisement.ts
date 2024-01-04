export interface Advertisement {
  id: number;
  uid: string;
  user_id: number;
  category_id?: number;

  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  draft: boolean;
  published_at: Date | null;
}
