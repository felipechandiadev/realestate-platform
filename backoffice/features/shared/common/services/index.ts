import { apiClient } from "@/lib/api/client";
import type { Config, UFValue, FeatureFlag, SystemSetting, ConfigResponse } from "../types";

const BASE_URL = "/common";

export async function getConfig(key: string): Promise<ConfigResponse> {
  const response = await apiClient.get<ConfigResponse>(`${BASE_URL}/config/${key}`);
  return response.data;
}

export async function getAllConfigs(): Promise<Config[]> {
  const response = await apiClient.get<Config[]>(`${BASE_URL}/config/all`);
  return response.data;
}

export async function getConfigByGroup(group: string): Promise<Config[]> {
  const response = await apiClient.get<Config[]>(`${BASE_URL}/config/group/${group}`);
  return response.data;
}

export async function getUFValue(date?: string): Promise<UFValue> {
  const params = date ? `?date=${date}` : "";
  const response = await apiClient.get<UFValue>(`${BASE_URL}/uf-value${params}`);
  return response.data;
}

export async function getUFValueHistory(startDate: string, endDate: string): Promise<UFValue[]> {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });
  const response = await apiClient.get<UFValue[]>(`${BASE_URL}/uf-value/history?${params.toString()}`);
  return response.data;
}

export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  const response = await apiClient.get<FeatureFlag[]>(`${BASE_URL}/feature-flags`);
  return response.data;
}

export async function getFeatureFlag(key: string): Promise<FeatureFlag> {
  const response = await apiClient.get<FeatureFlag>(`${BASE_URL}/feature-flags/${key}`);
  return response.data;
}

export async function getSystemSettings(): Promise<SystemSetting[]> {
  const response = await apiClient.get<SystemSetting[]>(`${BASE_URL}/system-settings`);
  return response.data;
}

export async function getSystemSetting(key: string): Promise<SystemSetting> {
  const response = await apiClient.get<SystemSetting>(`${BASE_URL}/system-settings/${key}`);
  return response.data;
}