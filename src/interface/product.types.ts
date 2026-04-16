export interface Offer {
  title: string;
  description: string;
  code?: string;
}

export interface Color {
  name: string;
  hex: string;
  imageUrl?: string;
}

export interface Size {
  label: string;
  available: boolean;
}

export interface Delivery {
  estimatedDays: number;
  isFree: boolean;
  charge?: number;
}

export interface Review {
  userId: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Store {
  id: string;
  name: string;
  location?: string;
}


export interface ProductAttributes {
  id: string;
  name: string;
  price: number;
  brand?: string | null;
  imageUrls?: string[] | null;
  description?: string;  
  stock: number;         
  category: string;      
  mrp?: number | null;
  currency?: string | null;
  rating?: number | null;
  ratingCount?: number | null;
  offers?: Offer[] | null;
  colors?: Color[] | null;
  sizes?: Size[] | null;
  delivery?: Delivery | null;
  topReview?: Review | null;
  store?: Store | null;
}

export interface ProductCreationAttributes
  extends Omit<ProductAttributes, "id" | "currency"> {
  id?: string;
  currency?: string;
}

export interface CreateProductInput {
  name: string;
  price: number;
  description?: string;
  stock?: number;
  category?: string;
  brand?: string;
  imageUrls?: string[];
  mrp?: number;
  currency?: string;
  rating?: number;
  ratingCount?: number;
  offers?: Offer[];
  colors?: Color[];
  sizes?: Size[];
  delivery?: Delivery;
  topReview?: Review;
  store?: Store;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface GetProductsFilters {
  search?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  page?: number | string;
  limit?: number | string;
}

export interface PaginatedProductsResponse {
  total: number;
  page: number;
  limit: number;
  data: ProductAttributes[];
}

export interface DeleteProductResponse {
  message: string;
}
