interface SystemLocation {
  lat: number;
  lng: number;
  source?: string;
}

declare global {
  interface Window {
    api?: {
      getSystemLocation?: () => Promise<SystemLocation>;
      // add other IPC methods here if needed
    };
  }
}

export {};
