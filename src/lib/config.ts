// Centralized configuration options for IGLA+ Records
export const WATER_POLO_DIVISIONS = [
  'Competitive',
  'Intermediate',
  'Recreational',
  'Womens'
] as const;

export type WaterPoloDivision = typeof WATER_POLO_DIVISIONS[number];
