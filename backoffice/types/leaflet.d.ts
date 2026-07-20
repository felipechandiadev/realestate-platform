declare module 'leaflet' {
  // Minimal ambient declarations to satisfy imports used in the project.
  export type LatLngExpression = any;
  export type LatLngLiteral = { lat: number; lng: number };
  export type IconOptions = any;
  export type TileLayerOptions = any;

  export interface LeafletMouseEvent {
    latlng: LatLngLiteral;
    layerPoint: any;
    containerPoint: any;
    originalEvent: any;
  }

  export class Map {
    setView(...args: any[]): any;
    panTo(...args: any[]): any;
  }

  export class Icon {
    constructor(options?: IconOptions);
  }

  export const icon: (options?: IconOptions) => Icon;

  const L: any;
  export default L;
}
