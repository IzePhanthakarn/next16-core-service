export type Property = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  created_at: string;
  updated_at?: string;
};

export type PropertiesData = {
  items: Property[];
  total_items: number;
  total_pages: number;
  current_page: number;
};

export type PropertiesResponse = {
  status: string;
  code: number;
  message: string;
  data: PropertiesData;
};

export type PropertiesQuery = {
  page?: number;
  limit?: number;
  name?: string;
  code?: string;
};

export type CreatePropertyInput = {
  name: string;
  code: string;
  description: string | null;
};

export const emptyProperties: PropertiesData = {
  items: [],
  total_items: 0,
  total_pages: 1,
  current_page: 1,
};

export const itemPerPageOptions = [10, 20, 31] as const;
