export type PropertyOption = {
  id: string;
  label: string;
  value: string;
  is_active: boolean;
  sort_order?: number;
};

export type UpdatePropertyOptionInput = {
  id: string;
  label: string;
  value: string;
  is_active: boolean;
  sort_order: number;
};

export type PropertyDetail = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  options: PropertyOption[];
};

export type PropertyDetailResponse = {
  status: string;
  code: number;
  message: string;
  data: PropertyDetail;
};

export type CreatePropertyOptionInput = {
  label: string;
  property_type_id: string;
  value: string;
};

export type UpdatePropertyInput = {
  name: string;
  code: string;
  description: string | null;
};

export type PropertyDetailFormState = {
  name: string;
  code: string;
  description: string;
};

export const getDefaultPropertyDetailForm = (
  detail: PropertyDetail,
): PropertyDetailFormState => ({
  name: detail.name,
  code: detail.code,
  description: detail.description ?? "",
});
