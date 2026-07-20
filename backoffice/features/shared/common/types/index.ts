export enum FeatureFlagStatus {
  ENABLED = "ENABLED",
  DISABLED = "DISABLED",
  BETA = "BETA",
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  status: FeatureFlagStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UFValue {
  id: string;
  value: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  type: "string" | "number" | "boolean" | "json";
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Config {
  id: string;
  key: string;
  value: unknown;
  group?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigResponse {
  key: string;
  value: unknown;
}