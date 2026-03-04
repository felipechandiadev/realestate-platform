// Enums related to the Property entity

export enum PropertyStatus {
  REQUEST = 'REQUEST',
  PRE_APPROVED = 'PRE-APPROVED',
  PUBLISHED = 'PUBLISHED',
  INACTIVE = 'INACTIVE',
  SOLD = 'SOLD',
  RENTED = 'RENTED',
  CONTRACT_IN_PROGRESS = 'CONTRACT-IN-PROGRESS',
}

export enum PropertyOperationType {
  SALE = 'SALE',
  RENT = 'RENT',
}

export enum CurrencyPriceEnum {
  CLP = 'CLP',
  UF = 'UF',
}

export enum RegionEnum {
  ARICA_Y_PARINACOTA = 'Arica y Parinacota',
  TARAPACA = 'Tarapacá',
  ANTOFAGASTA = 'Antofagasta',
  ATACAMA = 'Atacama',
  COQUIMBO = 'Coquimbo',
  VALPARAISO = 'Valparaíso',
  METROPOLITANA = 'Metropolitana de Santiago',
  OHIGGINS = "O'Higgins",
  MAULE = 'Maule',
  ÑUBLE = 'Ñuble',
  BIOBIO = 'Biobío',
  ARAUCANIA = 'La Araucanía',
  LOS_RIOS = 'Los Ríos',
  LOS_LAGOS = 'Los Lagos',
  AYSEN = 'Aysén',
  MAGALLANES = 'Magallanes',
}

export enum ComunaEnum {
  ARICA = 'Arica',
  CAMARONES = 'Camarones',
  PUTRE = 'Putre',
  GENERAL_LAGOS = 'General Lagos',
  // Add more as needed
}