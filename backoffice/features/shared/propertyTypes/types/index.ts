export interface PropertyCharacteristic {
  id: string;
  name: string;
  code: string;
  valueType: "string" | "number" | "boolean" | "enum";
  values?: string[];
  isRequired: boolean;
  order: number;
}

export interface PropertyTypeCategory {
  id: string;
  name: string;
  code: string;
  icon?: string;
  description?: string;
}

export interface PropertyType {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  category?: PropertyTypeCategory;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyTypeDetail {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  category: PropertyTypeCategory;
  description?: string;
  characteristics: PropertyCharacteristic[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}