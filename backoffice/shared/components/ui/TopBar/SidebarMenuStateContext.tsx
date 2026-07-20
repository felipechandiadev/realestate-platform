'use client';

import React, { createContext, useContext } from 'react';

export interface SidebarMenuStateValue {
  openItems: Record<string, boolean>;
  toggleItem: (id: string) => void;
  setItemState: (id: string, isOpen: boolean) => void;
  replaceState: (nextState: Record<string, boolean>) => void;
}

const SidebarMenuStateContext = createContext<SidebarMenuStateValue | null>(null);

export const SidebarMenuStateProvider = SidebarMenuStateContext.Provider;

export function useSidebarMenuState(): SidebarMenuStateValue | null {
  return useContext(SidebarMenuStateContext);
}
