import { load } from 'cheerio';
import { ChabadCenter } from '../types';
import { fetchPage, cleanText, extractPhone, sleep, formatTimestamp } from '../utils';

/**
 * Smart email pattern scraper.
 * Generates common Chabad email patterns and validates them by
 * checking if the associated website exists and extracting info from it.
 */

// Common email prefixes used by Chabad houses
const EMAIL_PREFIXES = [
  'rabbi', 'info', 'office', 'director', 'chabad', 'contact',
  'shabbat', 'programs', 'jewishlife', 'admin',
];

// Common Chabad website domain patterns
const DOMAIN_PATTERNS = [
  'chabadof{city}.com',
  'chabad{city}.com',
  'chabad{city}.org',
  'chabadof{city}.org',
  'jewishcommunityof{city}.com',
  'jewish{city}.com',
  'chabadhouse{city}.com',
  '{city}chabad.com',
  '{city}chabad.org',
  'chabadofthe{region}.com',
  'chabadofthe{region}.org',
];

interface CityEntry {
  city: string;
  slug: string;      // URL-friendly version
  state: string;
  country: string;
}

// Major cities in English-speaking countries
const CITIES: CityEntry[] = [
  // USA - Major metros & Jewish population centers
  // New York area
  { city: 'Manhattan', slug: 'manhattan', state: 'NY', country: 'United States' },
  { city: 'Upper East Side', slug: 'uppereastside', state: 'NY', country: 'United States' },
  { city: 'Upper West Side', slug: 'upperwestside', state: 'NY', country: 'United States' },
  { city: 'Midtown', slug: 'midtown', state: 'NY', country: 'United States' },
  { city: 'Tribeca', slug: 'tribeca', state: 'NY', country: 'United States' },
  { city: 'SoHo', slug: 'soho', state: 'NY', country: 'United States' },
  { city: 'Greenwich Village', slug: 'greenwichvillage', state: 'NY', country: 'United States' },
  { city: 'East Village', slug: 'eastvillage', state: 'NY', country: 'United States' },
  { city: 'West Village', slug: 'westvillage', state: 'NY', country: 'United States' },
  { city: 'Chelsea', slug: 'chelsea', state: 'NY', country: 'United States' },
  { city: 'Murray Hill', slug: 'murrayhill', state: 'NY', country: 'United States' },
  { city: 'Gramercy', slug: 'gramercy', state: 'NY', country: 'United States' },
  { city: 'Brooklyn', slug: 'brooklyn', state: 'NY', country: 'United States' },
  { city: 'Queens', slug: 'queens', state: 'NY', country: 'United States' },
  { city: 'Bronx', slug: 'bronx', state: 'NY', country: 'United States' },
  { city: 'Staten Island', slug: 'statenisland', state: 'NY', country: 'United States' },
  { city: 'Long Island', slug: 'longisland', state: 'NY', country: 'United States' },
  { city: 'Great Neck', slug: 'greatneck', state: 'NY', country: 'United States' },
  { city: 'Scarsdale', slug: 'scarsdale', state: 'NY', country: 'United States' },
  { city: 'White Plains', slug: 'whiteplains', state: 'NY', country: 'United States' },
  { city: 'New Rochelle', slug: 'newrochelle', state: 'NY', country: 'United States' },
  { city: 'Westchester', slug: 'westchester', state: 'NY', country: 'United States' },
  { city: 'Rockland', slug: 'rockland', state: 'NY', country: 'United States' },
  { city: 'Suffern', slug: 'suffern', state: 'NY', country: 'United States' },
  { city: 'Albany', slug: 'albany', state: 'NY', country: 'United States' },
  { city: 'Buffalo', slug: 'buffalo', state: 'NY', country: 'United States' },
  { city: 'Syracuse', slug: 'syracuse', state: 'NY', country: 'United States' },
  { city: 'Rochester', slug: 'rochester', state: 'NY', country: 'United States' },
  // California
  { city: 'Los Angeles', slug: 'losangeles', state: 'CA', country: 'United States' },
  { city: 'Beverly Hills', slug: 'beverlyhills', state: 'CA', country: 'United States' },
  { city: 'Santa Monica', slug: 'santamonica', state: 'CA', country: 'United States' },
  { city: 'Brentwood', slug: 'brentwood', state: 'CA', country: 'United States' },
  { city: 'Pacific Palisades', slug: 'pacificpalisades', state: 'CA', country: 'United States' },
  { city: 'Encino', slug: 'encino', state: 'CA', country: 'United States' },
  { city: 'Tarzana', slug: 'tarzana', state: 'CA', country: 'United States' },
  { city: 'Calabasas', slug: 'calabasas', state: 'CA', country: 'United States' },
  { city: 'Pasadena', slug: 'pasadena', state: 'CA', country: 'United States' },
  { city: 'San Diego', slug: 'sandiego', state: 'CA', country: 'United States' },
  { city: 'San Francisco', slug: 'sanfrancisco', state: 'CA', country: 'United States' },
  { city: 'San Jose', slug: 'sanjose', state: 'CA', country: 'United States' },
  { city: 'Palo Alto', slug: 'paloalto', state: 'CA', country: 'United States' },
  { city: 'Mountain View', slug: 'mountainview', state: 'CA', country: 'United States' },
  { city: 'Sunnyvale', slug: 'sunnyvale', state: 'CA', country: 'United States' },
  { city: 'Sacramento', slug: 'sacramento', state: 'CA', country: 'United States' },
  { city: 'Irvine', slug: 'irvine', state: 'CA', country: 'United States' },
  { city: 'Newport Beach', slug: 'newportbeach', state: 'CA', country: 'United States' },
  { city: 'Laguna Beach', slug: 'lagunabeach', state: 'CA', country: 'United States' },
  { city: 'Berkeley', slug: 'berkeley', state: 'CA', country: 'United States' },
  { city: 'Marin', slug: 'marin', state: 'CA', country: 'United States' },
  { city: 'Oakland', slug: 'oakland', state: 'CA', country: 'United States' },
  { city: 'Rancho Mirage', slug: 'ranchomirage', state: 'CA', country: 'United States' },
  { city: 'Palm Springs', slug: 'palmsprings', state: 'CA', country: 'United States' },
  { city: 'La Jolla', slug: 'lajolla', state: 'CA', country: 'United States' },
  // Florida
  { city: 'Miami', slug: 'miami', state: 'FL', country: 'United States' },
  { city: 'Miami Beach', slug: 'miamibeach', state: 'FL', country: 'United States' },
  { city: 'South Beach', slug: 'southbeach', state: 'FL', country: 'United States' },
  { city: 'Aventura', slug: 'aventura', state: 'FL', country: 'United States' },
  { city: 'Sunny Isles', slug: 'sunnyisles', state: 'FL', country: 'United States' },
  { city: 'Bal Harbour', slug: 'balharbour', state: 'FL', country: 'United States' },
  { city: 'Fort Lauderdale', slug: 'fortlauderdale', state: 'FL', country: 'United States' },
  { city: 'Boca Raton', slug: 'bocaraton', state: 'FL', country: 'United States' },
  { city: 'Palm Beach', slug: 'palmbeach', state: 'FL', country: 'United States' },
  { city: 'West Palm Beach', slug: 'westpalmbeach', state: 'FL', country: 'United States' },
  { city: 'Delray Beach', slug: 'delraybeach', state: 'FL', country: 'United States' },
  { city: 'Weston', slug: 'weston', state: 'FL', country: 'United States' },
  { city: 'Plantation', slug: 'plantation', state: 'FL', country: 'United States' },
  { city: 'Coral Springs', slug: 'coralsprings', state: 'FL', country: 'United States' },
  { city: 'Hollywood', slug: 'hollywoodfl', state: 'FL', country: 'United States' },
  { city: 'Orlando', slug: 'orlando', state: 'FL', country: 'United States' },
  { city: 'Tampa', slug: 'tampa', state: 'FL', country: 'United States' },
  { city: 'Jacksonville', slug: 'jacksonville', state: 'FL', country: 'United States' },
  { city: 'Naples', slug: 'naples', state: 'FL', country: 'United States' },
  { city: 'Sarasota', slug: 'sarasota', state: 'FL', country: 'United States' },
  { city: 'St Petersburg', slug: 'stpetersburg', state: 'FL', country: 'United States' },
  // Texas
  { city: 'Houston', slug: 'houston', state: 'TX', country: 'United States' },
  { city: 'Dallas', slug: 'dallas', state: 'TX', country: 'United States' },
  { city: 'Austin', slug: 'austin', state: 'TX', country: 'United States' },
  { city: 'San Antonio', slug: 'sanantonio', state: 'TX', country: 'United States' },
  { city: 'Plano', slug: 'plano', state: 'TX', country: 'United States' },
  { city: 'Frisco', slug: 'frisco', state: 'TX', country: 'United States' },
  { city: 'Sugar Land', slug: 'sugarland', state: 'TX', country: 'United States' },
  { city: 'El Paso', slug: 'elpaso', state: 'TX', country: 'United States' },
  // Illinois
  { city: 'Chicago', slug: 'chicago', state: 'IL', country: 'United States' },
  { city: 'Evanston', slug: 'evanston', state: 'IL', country: 'United States' },
  { city: 'Skokie', slug: 'skokie', state: 'IL', country: 'United States' },
  { city: 'Lincoln Park', slug: 'lincolnpark', state: 'IL', country: 'United States' },
  { city: 'Lakeview', slug: 'lakeview', state: 'IL', country: 'United States' },
  { city: 'Highland Park', slug: 'highlandpark', state: 'IL', country: 'United States' },
  { city: 'Naperville', slug: 'naperville', state: 'IL', country: 'United States' },
  // New Jersey
  { city: 'Hoboken', slug: 'hoboken', state: 'NJ', country: 'United States' },
  { city: 'Jersey City', slug: 'jerseycity', state: 'NJ', country: 'United States' },
  { city: 'Teaneck', slug: 'teaneck', state: 'NJ', country: 'United States' },
  { city: 'Livingston', slug: 'livingston', state: 'NJ', country: 'United States' },
  { city: 'Maplewood', slug: 'maplewood', state: 'NJ', country: 'United States' },
  { city: 'Morristown', slug: 'morristown', state: 'NJ', country: 'United States' },
  { city: 'Princeton', slug: 'princeton', state: 'NJ', country: 'United States' },
  { city: 'Cherry Hill', slug: 'cherryhill', state: 'NJ', country: 'United States' },
  { city: 'Montclair', slug: 'montclair', state: 'NJ', country: 'United States' },
  // Massachusetts
  { city: 'Boston', slug: 'boston', state: 'MA', country: 'United States' },
  { city: 'Cambridge', slug: 'cambridge', state: 'MA', country: 'United States' },
  { city: 'Brookline', slug: 'brookline', state: 'MA', country: 'United States' },
  { city: 'Newton', slug: 'newton', state: 'MA', country: 'United States' },
  { city: 'Wellesley', slug: 'wellesley', state: 'MA', country: 'United States' },
  // Pennsylvania
  { city: 'Philadelphia', slug: 'philadelphia', state: 'PA', country: 'United States' },
  { city: 'Pittsburgh', slug: 'pittsburgh', state: 'PA', country: 'United States' },
  { city: 'Main Line', slug: 'mainline', state: 'PA', country: 'United States' },
  // Maryland
  { city: 'Baltimore', slug: 'baltimore', state: 'MD', country: 'United States' },
  { city: 'Bethesda', slug: 'bethesda', state: 'MD', country: 'United States' },
  { city: 'Rockville', slug: 'rockville', state: 'MD', country: 'United States' },
  { city: 'Silver Spring', slug: 'silverspring', state: 'MD', country: 'United States' },
  // Connecticut
  { city: 'Westport', slug: 'westport', state: 'CT', country: 'United States' },
  { city: 'Stamford', slug: 'stamford', state: 'CT', country: 'United States' },
  { city: 'New Haven', slug: 'newhaven', state: 'CT', country: 'United States' },
  { city: 'Greenwich', slug: 'greenwich', state: 'CT', country: 'United States' },
  { city: 'Fairfield', slug: 'fairfield', state: 'CT', country: 'United States' },
  // Georgia
  { city: 'Atlanta', slug: 'atlanta', state: 'GA', country: 'United States' },
  { city: 'Savannah', slug: 'savannah', state: 'GA', country: 'United States' },
  { city: 'Alpharetta', slug: 'alpharetta', state: 'GA', country: 'United States' },
  // Arizona
  { city: 'Scottsdale', slug: 'scottsdale', state: 'AZ', country: 'United States' },
  { city: 'Phoenix', slug: 'phoenix', state: 'AZ', country: 'United States' },
  { city: 'Tucson', slug: 'tucson', state: 'AZ', country: 'United States' },
  { city: 'Chandler', slug: 'chandler', state: 'AZ', country: 'United States' },
  // Colorado
  { city: 'Denver', slug: 'denver', state: 'CO', country: 'United States' },
  { city: 'Boulder', slug: 'boulder', state: 'CO', country: 'United States' },
  { city: 'Aspen', slug: 'aspen', state: 'CO', country: 'United States' },
  { city: 'Vail', slug: 'vail', state: 'CO', country: 'United States' },
  // Nevada
  { city: 'Las Vegas', slug: 'lasvegas', state: 'NV', country: 'United States' },
  { city: 'Henderson', slug: 'henderson', state: 'NV', country: 'United States' },
  { city: 'Reno', slug: 'reno', state: 'NV', country: 'United States' },
  // Washington
  { city: 'Seattle', slug: 'seattle', state: 'WA', country: 'United States' },
  { city: 'Bellevue', slug: 'bellevue', state: 'WA', country: 'United States' },
  { city: 'Mercer Island', slug: 'mercerisland', state: 'WA', country: 'United States' },
  // Oregon
  { city: 'Portland', slug: 'portland', state: 'OR', country: 'United States' },
  { city: 'Eugene', slug: 'eugene', state: 'OR', country: 'United States' },
  // Michigan
  { city: 'Ann Arbor', slug: 'annarbor', state: 'MI', country: 'United States' },
  { city: 'Detroit', slug: 'detroit', state: 'MI', country: 'United States' },
  { city: 'West Bloomfield', slug: 'westbloomfield', state: 'MI', country: 'United States' },
  // Ohio
  { city: 'Cleveland', slug: 'cleveland', state: 'OH', country: 'United States' },
  { city: 'Columbus', slug: 'columbus', state: 'OH', country: 'United States' },
  { city: 'Cincinnati', slug: 'cincinnati', state: 'OH', country: 'United States' },
  // Minnesota
  { city: 'Minneapolis', slug: 'minneapolis', state: 'MN', country: 'United States' },
  { city: 'St Paul', slug: 'stpaul', state: 'MN', country: 'United States' },
  // Missouri
  { city: 'St Louis', slug: 'stlouis', state: 'MO', country: 'United States' },
  { city: 'Kansas City', slug: 'kansascity', state: 'MO', country: 'United States' },
  // Virginia
  { city: 'Richmond', slug: 'richmond', state: 'VA', country: 'United States' },
  { city: 'Fairfax', slug: 'fairfax', state: 'VA', country: 'United States' },
  { city: 'Charlottesville', slug: 'charlottesville', state: 'VA', country: 'United States' },
  { city: 'Arlington', slug: 'arlington', state: 'VA', country: 'United States' },
  { city: 'Tysons', slug: 'tysons', state: 'VA', country: 'United States' },
  // North Carolina
  { city: 'Charlotte', slug: 'charlotte', state: 'NC', country: 'United States' },
  { city: 'Raleigh', slug: 'raleigh', state: 'NC', country: 'United States' },
  { city: 'Durham', slug: 'durham', state: 'NC', country: 'United States' },
  { city: 'Chapel Hill', slug: 'chapelhill', state: 'NC', country: 'United States' },
  // South Carolina
  { city: 'Charleston', slug: 'charleston', state: 'SC', country: 'United States' },
  // DC
  { city: 'Washington DC', slug: 'dc', state: 'DC', country: 'United States' },
  { city: 'Georgetown', slug: 'georgetown', state: 'DC', country: 'United States' },
  { city: 'Dupont Circle', slug: 'dupontcircle', state: 'DC', country: 'United States' },
  // Hawaii
  { city: 'Hawaii', slug: 'hawaii', state: 'HI', country: 'United States' },
  { city: 'Honolulu', slug: 'honolulu', state: 'HI', country: 'United States' },
  { city: 'Maui', slug: 'maui', state: 'HI', country: 'United States' },
  // Other US states
  { city: 'Nashville', slug: 'nashville', state: 'TN', country: 'United States' },
  { city: 'Memphis', slug: 'memphis', state: 'TN', country: 'United States' },
  { city: 'Indianapolis', slug: 'indianapolis', state: 'IN', country: 'United States' },
  { city: 'Milwaukee', slug: 'milwaukee', state: 'WI', country: 'United States' },
  { city: 'Madison', slug: 'madison', state: 'WI', country: 'United States' },
  { city: 'New Orleans', slug: 'neworleans', state: 'LA', country: 'United States' },
  { city: 'Baton Rouge', slug: 'batonrouge', state: 'LA', country: 'United States' },
  { city: 'Salt Lake City', slug: 'saltlakecity', state: 'UT', country: 'United States' },
  { city: 'Park City', slug: 'parkcity', state: 'UT', country: 'United States' },
  { city: 'Omaha', slug: 'omaha', state: 'NE', country: 'United States' },
  { city: 'Des Moines', slug: 'desmoines', state: 'IA', country: 'United States' },
  { city: 'Albuquerque', slug: 'albuquerque', state: 'NM', country: 'United States' },
  { city: 'Santa Fe', slug: 'santafe', state: 'NM', country: 'United States' },
  { city: 'Oklahoma City', slug: 'oklahomacity', state: 'OK', country: 'United States' },
  { city: 'Tulsa', slug: 'tulsa', state: 'OK', country: 'United States' },
  { city: 'Anchorage', slug: 'anchorage', state: 'AK', country: 'United States' },

  // Canada
  { city: 'Toronto', slug: 'toronto', state: 'ON', country: 'Canada' },
  { city: 'Montreal', slug: 'montreal', state: 'QC', country: 'Canada' },
  { city: 'Vancouver', slug: 'vancouver', state: 'BC', country: 'Canada' },
  { city: 'Ottawa', slug: 'ottawa', state: 'ON', country: 'Canada' },
  { city: 'Calgary', slug: 'calgary', state: 'AB', country: 'Canada' },
  { city: 'Edmonton', slug: 'edmonton', state: 'AB', country: 'Canada' },
  { city: 'Winnipeg', slug: 'winnipeg', state: 'MB', country: 'Canada' },
  { city: 'Halifax', slug: 'halifax', state: 'NS', country: 'Canada' },
  { city: 'Victoria', slug: 'victoria', state: 'BC', country: 'Canada' },
  { city: 'Hamilton', slug: 'hamilton', state: 'ON', country: 'Canada' },
  { city: 'Waterloo', slug: 'waterloo', state: 'ON', country: 'Canada' },
  { city: 'Markham', slug: 'markham', state: 'ON', country: 'Canada' },
  { city: 'Thornhill', slug: 'thornhill', state: 'ON', country: 'Canada' },

  // United Kingdom
  { city: 'London', slug: 'london', state: '', country: 'United Kingdom' },
  { city: 'Central London', slug: 'centrallondon', state: '', country: 'United Kingdom' },
  { city: 'North London', slug: 'northlondon', state: '', country: 'United Kingdom' },
  { city: 'South London', slug: 'southlondon', state: '', country: 'United Kingdom' },
  { city: 'Golders Green', slug: 'goldersgreen', state: '', country: 'United Kingdom' },
  { city: 'Hampstead', slug: 'hampstead', state: '', country: 'United Kingdom' },
  { city: 'Hendon', slug: 'hendon', state: '', country: 'United Kingdom' },
  { city: 'Manchester', slug: 'manchester', state: '', country: 'United Kingdom' },
  { city: 'Leeds', slug: 'leeds', state: '', country: 'United Kingdom' },
  { city: 'Birmingham', slug: 'birmingham', state: '', country: 'United Kingdom' },
  { city: 'Edinburgh', slug: 'edinburgh', state: '', country: 'United Kingdom' },
  { city: 'Glasgow', slug: 'glasgow', state: '', country: 'United Kingdom' },
  { city: 'Oxford', slug: 'oxford', state: '', country: 'United Kingdom' },
  { city: 'Cambridge', slug: 'cambridgeuk', state: '', country: 'United Kingdom' },
  { city: 'Brighton', slug: 'brighton', state: '', country: 'United Kingdom' },
  { city: 'Liverpool', slug: 'liverpool', state: '', country: 'United Kingdom' },
  { city: 'Bristol', slug: 'bristol', state: '', country: 'United Kingdom' },
  { city: 'Nottingham', slug: 'nottingham', state: '', country: 'United Kingdom' },

  // Australia
  { city: 'Sydney', slug: 'sydney', state: 'NSW', country: 'Australia' },
  { city: 'Melbourne', slug: 'melbourne', state: 'VIC', country: 'Australia' },
  { city: 'Brisbane', slug: 'brisbane', state: 'QLD', country: 'Australia' },
  { city: 'Perth', slug: 'perth', state: 'WA', country: 'Australia' },
  { city: 'Adelaide', slug: 'adelaide', state: 'SA', country: 'Australia' },
  { city: 'Gold Coast', slug: 'goldcoast', state: 'QLD', country: 'Australia' },
  { city: 'Canberra', slug: 'canberra', state: 'ACT', country: 'Australia' },
  { city: 'Bondi', slug: 'bondi', state: 'NSW', country: 'Australia' },
  { city: 'St Kilda', slug: 'stkilda', state: 'VIC', country: 'Australia' },

  // South Africa
  { city: 'Cape Town', slug: 'capetown', state: '', country: 'South Africa' },
  { city: 'Johannesburg', slug: 'johannesburg', state: '', country: 'South Africa' },
  { city: 'Durban', slug: 'durban', state: '', country: 'South Africa' },
  { city: 'Pretoria', slug: 'pretoria', state: '', country: 'South Africa' },
  { city: 'Sandton', slug: 'sandton', state: '', country: 'South Africa' },

  // New Zealand
  { city: 'Auckland', slug: 'auckland', state: '', country: 'New Zealand' },
  { city: 'Wellington', slug: 'wellington', state: '', country: 'New Zealand' },
  { city: 'Christchurch', slug: 'christchurch', state: '', country: 'New Zealand' },

  // Israel
  { city: 'Tel Aviv', slug: 'telaviv', state: '', country: 'Israel' },
  { city: 'Jerusalem', slug: 'jerusalem', state: '', country: 'Israel' },
  { city: 'Haifa', slug: 'haifa', state: '', country: 'Israel' },
  { city: 'Eilat', slug: 'eilat', state: '', country: 'Israel' },
  { city: 'Herzliya', slug: 'herzliya', state: '', country: 'Israel' },
  { city: 'Netanya', slug: 'netanya', state: '', country: 'Israel' },
];

// Region-based patterns (for "Chabad of the Valley", etc)
const REGIONS = [
  'valley', 'beaches', 'desert', 'mountains', 'hills',
  'shore', 'coast', 'harbor', 'bay', 'lakes', 'keys',
  'hamptons', 'poconos', 'berkshires', 'catskills', 'ozarks',
  'mainline', 'northshore', 'southshore', 'eastside', 'westside',
  'downtown', 'uptown', 'midtown',
];

function generateAllUrls(): Array<{ url: string; city: CityEntry }> {
  const urls: Array<{ url: string; city: CityEntry }> = [];

  for (const city of CITIES) {
    // Standard patterns: chabadof{city}.com, chabad{city}.com, etc.
    const patterns = [
      `https://www.chabadof${city.slug}.com`,
      `https://www.chabad${city.slug}.com`,
      `https://www.chabad${city.slug}.org`,
      `https://www.chabadof${city.slug}.org`,
      `https://www.${city.slug}chabad.com`,
      `https://www.jewishof${city.slug}.com`,
      `https://www.jewish${city.slug}.com`,
    ];
    for (const url of patterns) {
      urls.push({ url, city });
    }
  }

  // Add region-based URLs
  for (const region of REGIONS) {
    const regionCity: CityEntry = {
      city: region.charAt(0).toUpperCase() + region.slice(1),
      slug: region,
      state: '',
      country: 'United States',
    };
    urls.push({ url: `https://www.chabadofthe${region}.com`, city: regionCity });
    urls.push({ url: `https://www.chabadofthe${region}.org`, city: regionCity });
  }

  return urls;
}

export async function scrapeByEmailPattern(): Promise<ChabadCenter[]> {
  const allCenters: ChabadCenter[] = [];
  const urls = generateAllUrls();

  console.log(`\n=== Smart Email Pattern Scraper ===`);
  console.log(`Generated ${urls.length} potential Chabad website URLs to check`);
  console.log(`Checking websites and extracting contact info...\n`);

  let found = 0;
  let checked = 0;
  const batchSize = 5; // concurrent requests

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async ({ url, city }) => {
        try {
          const html = await fetchPage(url);
          if (!html) return null;

          const center = extractCenterInfo(html, url, city);
          if (center && (center.email || center.phone)) {
            return center;
          }
          return null;
        } catch {
          return null;
        }
      })
    );

    for (const result of results) {
      checked++;
      if (result.status === 'fulfilled' && result.value) {
        allCenters.push(result.value);
        found++;
        console.log(`  [+] ${result.value.name || result.value.website} | ${result.value.email} | ${result.value.phone}`);
      }
    }

    // Progress every 50 checked
    if (checked % 50 === 0 || i + batchSize >= urls.length) {
      const pct = Math.round((checked / urls.length) * 100);
      console.log(`  --- Progress: ${checked}/${urls.length} checked (${pct}%), ${found} found ---`);
    }

    await sleep(300);
  }

  console.log(`\nEmail pattern scraper complete: ${found} centers found from ${checked} URLs checked`);
  return allCenters;
}

function extractCenterInfo(html: string, url: string, city: CityEntry): ChabadCenter | null {
  const $ = load(html);

  // Get center name from title or h1
  let name = cleanText($('title').text()) ||
    cleanText($('h1').first().text()) ||
    cleanText($('meta[property="og:site_name"]').attr('content') || '');
  name = name
    .replace(/\s*[-|–—]\s*(Home|Welcome|Main).*$/i, '')
    .replace(/^\s*(Home|Welcome)\s*[-|–—]\s*/i, '');

  // Extract ALL emails from the page
  const htmlStr = $.html();
  const emailMatches = htmlStr.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [];
  const filteredEmails = [...new Set(emailMatches)]
    .filter(e =>
      !e.includes('example.com') &&
      !e.includes('sentry') &&
      !e.includes('wixpress') &&
      !e.includes('wordpress') &&
      !e.includes('google.com') &&
      !e.includes('w3.org') &&
      !e.includes('schema.org') &&
      !e.includes('cloudflare') &&
      !e.includes('jsdelivr') &&
      !e.includes('.png') &&
      !e.includes('.jpg') &&
      !e.includes('noreply') &&
      !e.includes('donotreply') &&
      e.length < 60
    );
  const email = filteredEmails.join('; ');

  // Extract phone from tel: links first, then from text
  const phoneFromLinks: string[] = [];
  $('a[href^="tel:"]').each((_i, el) => {
    const tel = $(el).attr('href')?.replace('tel:', '').trim();
    if (tel) phoneFromLinks.push(tel);
  });
  const phone = phoneFromLinks[0] || extractPhone($('body').text());

  // Extract rabbi name
  let rabbi = '';
  const bodyText = $('body').text();
  const rabbiPatterns = [
    /Rabbi\s+([A-Z][a-z]+(?:\s+(?:and\s+)?(?:[A-Z]\.?\s+)?[A-Z][a-z]+){1,3})/,
    /(?:Director|Shliach|Emissary)[:\s]+(?:Rabbi\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
  ];
  for (const pattern of rabbiPatterns) {
    const match = bodyText.match(pattern);
    if (match) {
      rabbi = match[1].trim();
      break;
    }
  }

  // Extract rebbetzin name
  let rebbetzin = '';
  const rebbetzinMatch = bodyText.match(
    /(?:Rebbetzin|Mrs\.?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/
  );
  if (rebbetzinMatch) rebbetzin = rebbetzinMatch[1].trim();

  // Extract address from structured data or common selectors
  let address = cleanText(
    $('[itemprop="streetAddress"]').text() ||
    $('[itemprop="address"]').text() ||
    $('.address').text() ||
    $('.location-address').text()
  );

  const structuredCity = cleanText($('[itemprop="addressLocality"]').text()) || city.city;
  const structuredState = cleanText($('[itemprop="addressRegion"]').text()) || city.state;
  const zipCode = cleanText($('[itemprop="postalCode"]').text());

  if (!email && !phone) return null;

  return {
    name: name || `Chabad of ${city.city}`,
    rabbi,
    rebbetzin,
    address,
    city: structuredCity,
    state: structuredState,
    country: city.country,
    zipCode,
    phone,
    email,
    website: url,
    source: 'email-pattern',
    sourceUrl: url,
    scrapedAt: formatTimestamp(),
  };
}
