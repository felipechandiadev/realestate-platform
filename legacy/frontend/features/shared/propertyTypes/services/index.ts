import { apiClient } from "@/lib/api/client";
import type { PropertyType, PropertyTypeCategory, PropertyCharacteristic, PropertyTypeDetail } from "../types";

const BASE_URL = "/property-types";

export async function listPropertyTypes(): Promise<PropertyType[]> {
  const response = await apiClient.get<PropertyType[]>(`${BASE_URL}`);
  return response.data;
}

export async function getPropertyType(typeId: string): Promise<PropertyTypeDetail> {
  const response = await apiClient.get<PropertyTypeDetail>(`${BASE_URL}/${typeId}`);
  return response.data;
}

export async function listPropertyTypesByCategory(categoryId: string): Promise<PropertyType[]> {
  const response = await apiClient.get<PropertyType[]>(`${BASE_URL}/category/${categoryId}`);
  return response.data;
}

export async function getCharacteristics(typeId: string): Promise<PropertyCharacteristic[]> {
  const response = await apiClient.get<PropertyCharacteristic[]>(`${BASE_URL}/${typeId}/characteristics`);
  return response.data;
}

export async function listCategories(): Promise<PropertyTypeCategory[]> {
  const response = await apiClient.get<PropertyTypeCategory[]>(`${BASE_URL}/categories`);
  return response.data;
}

export async function getCategory(categoryId: string): Promise<PropertyTypeCategory> {
  const response = await apiClient.get<PropertyTypeCategory>(`${BASE_URL}/categories/${categoryId}`);
  return response.data;
}

export async function searchPropertyTypes(query: string): Promise<PropertyType[]> {
  const params = new URLSearchParams({ query });
  const response = await apiClient.get<PropertyType[]>(`${BASE_URL}/search?${params.toString()}`);
  return response.data;
}