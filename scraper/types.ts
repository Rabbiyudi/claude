export interface ChabadCenter {
  name: string;
  rabbi: string;
  rebbetzin: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  source: string;
  sourceUrl: string;
  scrapedAt: string;
}

export interface ScrapeResult {
  centers: ChabadCenter[];
  errors: string[];
  totalScraped: number;
  duration: number;
}

export interface CountryConfig {
  name: string;
  code: string;
  chabadOrgPath: string;
}
