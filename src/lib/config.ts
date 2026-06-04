// Centralized configuration options for IGLA+ Records
export const WATER_POLO_DIVISIONS = [
  'Competitive',
  'Intermediate',
  'Recreational',
  'Womens'
] as const;

export type WaterPoloDivision = typeof WATER_POLO_DIVISIONS[number];

export const SWIMMING_AGE_CATEGORIES = [
  '18-24',
  '25-29',
  '30-34',
  '35-39',
  '40-44',
  '45-49',
  '50-54',
  '55-59',
  '60-64',
  '65-69',
  '70-74',
  '75-79',
  '80-84',
  '85-89',
  '90-94',
  '95-99'
] as const;

export type SwimmingAgeCategory = typeof SWIMMING_AGE_CATEGORIES[number];

