import { CountryConfig } from './types';

export const ENGLISH_SPEAKING_COUNTRIES: CountryConfig[] = [
  { name: 'United States', code: 'USA', chabadOrgPath: '/jewish-centers/country/USA' },
  { name: 'Canada', code: 'CA', chabadOrgPath: '/jewish-centers/country/CA' },
  { name: 'United Kingdom', code: 'GB', chabadOrgPath: '/jewish-centers/country/GB' },
  { name: 'Australia', code: 'AU', chabadOrgPath: '/jewish-centers/country/AU' },
  { name: 'South Africa', code: 'ZA', chabadOrgPath: '/jewish-centers/country/ZA' },
  { name: 'New Zealand', code: 'NZ', chabadOrgPath: '/jewish-centers/country/NZ' },
  { name: 'Israel', code: 'IL', chabadOrgPath: '/jewish-centers/country/IL' },
];

export const ALL_COUNTRIES: CountryConfig[] = [
  ...ENGLISH_SPEAKING_COUNTRIES,
  { name: 'France', code: 'FR', chabadOrgPath: '/jewish-centers/country/FR' },
  { name: 'Germany', code: 'DE', chabadOrgPath: '/jewish-centers/country/DE' },
  { name: 'Argentina', code: 'AR', chabadOrgPath: '/jewish-centers/country/AR' },
  { name: 'Brazil', code: 'BR', chabadOrgPath: '/jewish-centers/country/BR' },
  { name: 'Russia', code: 'RU', chabadOrgPath: '/jewish-centers/country/RU' },
  { name: 'Ukraine', code: 'UA', chabadOrgPath: '/jewish-centers/country/UA' },
  { name: 'Thailand', code: 'TH', chabadOrgPath: '/jewish-centers/country/TH' },
  { name: 'India', code: 'IN', chabadOrgPath: '/jewish-centers/country/IN' },
  { name: 'Mexico', code: 'MX', chabadOrgPath: '/jewish-centers/country/MX' },
  { name: 'Italy', code: 'IT', chabadOrgPath: '/jewish-centers/country/IT' },
  { name: 'Spain', code: 'ES', chabadOrgPath: '/jewish-centers/country/ES' },
  { name: 'Netherlands', code: 'NL', chabadOrgPath: '/jewish-centers/country/NL' },
  { name: 'Switzerland', code: 'CH', chabadOrgPath: '/jewish-centers/country/CH' },
  { name: 'Austria', code: 'AT', chabadOrgPath: '/jewish-centers/country/AT' },
  { name: 'Japan', code: 'JP', chabadOrgPath: '/jewish-centers/country/JP' },
  { name: 'China', code: 'CN', chabadOrgPath: '/jewish-centers/country/CN' },
  { name: 'Panama', code: 'PA', chabadOrgPath: '/jewish-centers/country/PA' },
  { name: 'Colombia', code: 'CO', chabadOrgPath: '/jewish-centers/country/CO' },
  { name: 'Morocco', code: 'MA', chabadOrgPath: '/jewish-centers/country/MA' },
];

export const CHABAD_ORG_BASE = 'https://www.chabad.org';

export const REQUEST_DELAY_MS = 1500;
export const MAX_RETRIES = 3;
export const RETRY_DELAY_MS = 3000;

export const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia',
];

export const CANADIAN_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
  'Prince Edward Island', 'Quebec', 'Saskatchewan',
];
