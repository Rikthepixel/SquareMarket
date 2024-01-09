export interface CategoryResponse {
  uid: string;
  name: string;
  properties: {
    uid: string;
    name: string;
    options: {
      uid: string;
      name: string;
    }[];
  }[];
}
