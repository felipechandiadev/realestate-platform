import { useQuery, UseQueryResult } from "@tanstack/react-query";
import * as CommonService from "../services";
import type { Config, UFValue, FeatureFlag, SystemSetting, ConfigResponse } from "../types";

export function useConfig(key: string): UseQueryResult<ConfigResponse, Error> {
  return useQuery({
    queryKey: ["common", "config", key],
    queryFn: () => CommonService.getConfig(key),
    staleTime: 1000 * 60 * 60,
  });
}

export function useAllConfigs(): UseQueryResult<Config[], Error> {
  return useQuery({
    queryKey: ["common", "config", "all"],
    queryFn: CommonService.getAllConfigs,
    staleTime: 1000 * 60 * 60,
  });
}

export function useConfigByGroup(group: string): UseQueryResult<Config[], Error> {
  return useQuery({
    queryKey: ["common", "config", "group", group],
    queryFn: () => CommonService.getConfigByGroup(group),
    staleTime: 1000 * 60 * 60,
  });
}

export function useUFValue(date?: string): UseQueryResult<UFValue, Error> {
  return useQuery({
    queryKey: ["common", "uf-value", date],
    queryFn: () => CommonService.getUFValue(date),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useUFValueHistory(startDate: string, endDate: string): UseQueryResult<UFValue[], Error> {
  return useQuery({
    queryKey: ["common", "uf-value", "history", startDate, endDate],
    queryFn: () => CommonService.getUFValueHistory(startDate, endDate),
    staleTime: 1000 * 60 * 60,
  });
}

export function useFeatureFlags(): UseQueryResult<FeatureFlag[], Error> {
  return useQuery({
    queryKey: ["common", "feature-flags"],
    queryFn: CommonService.getFeatureFlags,
    staleTime: 1000 * 60 * 5,
  });
}

export function useFeatureFlag(key: string): UseQueryResult<FeatureFlag, Error> {
  return useQuery({
    queryKey: ["common", "feature-flags", key],
    queryFn: () => CommonService.getFeatureFlag(key),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSystemSettings(): UseQueryResult<SystemSetting[], Error> {
  return useQuery({
    queryKey: ["common", "system-settings"],
    queryFn: CommonService.getSystemSettings,
    staleTime: 1000 * 60 * 60,
  });
}

export function useSystemSetting(key: string): UseQueryResult<SystemSetting, Error> {
  return useQuery({
    queryKey: ["common", "system-settings", key],
    queryFn: () => CommonService.getSystemSetting(key),
    staleTime: 1000 * 60 * 60,
  });
}