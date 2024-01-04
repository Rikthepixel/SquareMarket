export type PublicAdvertisementResponse = {
  uid: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  draft: boolean;
  published_at: Date;
  images: string[];
  category: {
    uid: string;
    name: string;
  };
  user: {
    uid: string;
    name: string;
  };
  propertyValues: {
    uid: string;
    property_name: string;
    option_name: string;
    category_property_uid: string;
    category_property_option_uid: string;
  }[];
};
