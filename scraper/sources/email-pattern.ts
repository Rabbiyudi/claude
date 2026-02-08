import { load } from 'cheerio';
import { ChabadCenter } from '../types';
import { fetchPage, cleanText, extractPhone, sleep, formatTimestamp } from '../utils';

/**
 * Smart email pattern scraper - EXPANDED version.
 * Generates known Chabad website URL patterns, checks if they exist,
 * and extracts all contact info from live websites.
 * Also follows /contact and /about pages for additional data.
 */

interface CityEntry {
  city: string;
  slug: string;
  state: string;
  country: string;
}

// ========================================================
//  600+ CITIES across English-speaking countries + global
// ========================================================
const CITIES: CityEntry[] = [
  // ===================== USA =====================
  // New York Metro
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
  { city: 'Flatiron', slug: 'flatiron', state: 'NY', country: 'United States' },
  { city: 'Financial District', slug: 'fidi', state: 'NY', country: 'United States' },
  { city: 'Battery Park', slug: 'batterypark', state: 'NY', country: 'United States' },
  { city: 'Harlem', slug: 'harlem', state: 'NY', country: 'United States' },
  { city: 'Washington Heights', slug: 'washingtonheights', state: 'NY', country: 'United States' },
  { city: 'Inwood', slug: 'inwood', state: 'NY', country: 'United States' },
  { city: 'Brooklyn', slug: 'brooklyn', state: 'NY', country: 'United States' },
  { city: 'Park Slope', slug: 'parkslope', state: 'NY', country: 'United States' },
  { city: 'Williamsburg', slug: 'williamsburg', state: 'NY', country: 'United States' },
  { city: 'Crown Heights', slug: 'crownheights', state: 'NY', country: 'United States' },
  { city: 'Flatbush', slug: 'flatbush', state: 'NY', country: 'United States' },
  { city: 'Bay Ridge', slug: 'bayridge', state: 'NY', country: 'United States' },
  { city: 'Bensonhurst', slug: 'bensonhurst', state: 'NY', country: 'United States' },
  { city: 'Brighton Beach', slug: 'brightonbeach', state: 'NY', country: 'United States' },
  { city: 'Sheepshead Bay', slug: 'sheepsheadbay', state: 'NY', country: 'United States' },
  { city: 'Cobble Hill', slug: 'cobblehill', state: 'NY', country: 'United States' },
  { city: 'DUMBO', slug: 'dumbo', state: 'NY', country: 'United States' },
  { city: 'Bushwick', slug: 'bushwick', state: 'NY', country: 'United States' },
  { city: 'Queens', slug: 'queens', state: 'NY', country: 'United States' },
  { city: 'Astoria', slug: 'astoria', state: 'NY', country: 'United States' },
  { city: 'Flushing', slug: 'flushing', state: 'NY', country: 'United States' },
  { city: 'Forest Hills', slug: 'foresthills', state: 'NY', country: 'United States' },
  { city: 'Jamaica', slug: 'jamaica', state: 'NY', country: 'United States' },
  { city: 'Kew Gardens', slug: 'kewgardens', state: 'NY', country: 'United States' },
  { city: 'Rego Park', slug: 'regopark', state: 'NY', country: 'United States' },
  { city: 'Bayside', slug: 'bayside', state: 'NY', country: 'United States' },
  { city: 'Bronx', slug: 'bronx', state: 'NY', country: 'United States' },
  { city: 'Riverdale', slug: 'riverdale', state: 'NY', country: 'United States' },
  { city: 'Staten Island', slug: 'statenisland', state: 'NY', country: 'United States' },
  { city: 'Long Island', slug: 'longisland', state: 'NY', country: 'United States' },
  { city: 'Great Neck', slug: 'greatneck', state: 'NY', country: 'United States' },
  { city: 'Roslyn', slug: 'roslyn', state: 'NY', country: 'United States' },
  { city: 'Manhasset', slug: 'manhasset', state: 'NY', country: 'United States' },
  { city: 'Woodmere', slug: 'woodmere', state: 'NY', country: 'United States' },
  { city: 'Cedarhurst', slug: 'cedarhurst', state: 'NY', country: 'United States' },
  { city: 'Lawrence', slug: 'lawrence', state: 'NY', country: 'United States' },
  { city: 'Hewlett', slug: 'hewlett', state: 'NY', country: 'United States' },
  { city: 'Plainview', slug: 'plainview', state: 'NY', country: 'United States' },
  { city: 'Syosset', slug: 'syosset', state: 'NY', country: 'United States' },
  { city: 'Huntington', slug: 'huntington', state: 'NY', country: 'United States' },
  { city: 'Commack', slug: 'commack', state: 'NY', country: 'United States' },
  { city: 'Dix Hills', slug: 'dixhills', state: 'NY', country: 'United States' },
  { city: 'Stony Brook', slug: 'stonybrook', state: 'NY', country: 'United States' },
  { city: 'Port Washington', slug: 'portwashington', state: 'NY', country: 'United States' },
  // Westchester & Upstate NY
  { city: 'Scarsdale', slug: 'scarsdale', state: 'NY', country: 'United States' },
  { city: 'White Plains', slug: 'whiteplains', state: 'NY', country: 'United States' },
  { city: 'New Rochelle', slug: 'newrochelle', state: 'NY', country: 'United States' },
  { city: 'Westchester', slug: 'westchester', state: 'NY', country: 'United States' },
  { city: 'Rockland', slug: 'rockland', state: 'NY', country: 'United States' },
  { city: 'Suffern', slug: 'suffern', state: 'NY', country: 'United States' },
  { city: 'Nyack', slug: 'nyack', state: 'NY', country: 'United States' },
  { city: 'Larchmont', slug: 'larchmont', state: 'NY', country: 'United States' },
  { city: 'Mamaroneck', slug: 'mamaroneck', state: 'NY', country: 'United States' },
  { city: 'Dobbs Ferry', slug: 'dobbsferry', state: 'NY', country: 'United States' },
  { city: 'Tarrytown', slug: 'tarrytown', state: 'NY', country: 'United States' },
  { city: 'Yonkers', slug: 'yonkers', state: 'NY', country: 'United States' },
  { city: 'Ossining', slug: 'ossining', state: 'NY', country: 'United States' },
  { city: 'Albany', slug: 'albany', state: 'NY', country: 'United States' },
  { city: 'Buffalo', slug: 'buffalo', state: 'NY', country: 'United States' },
  { city: 'Syracuse', slug: 'syracuse', state: 'NY', country: 'United States' },
  { city: 'Rochester', slug: 'rochester', state: 'NY', country: 'United States' },
  { city: 'Ithaca', slug: 'ithaca', state: 'NY', country: 'United States' },
  { city: 'Binghamton', slug: 'binghamton', state: 'NY', country: 'United States' },
  { city: 'Poughkeepsie', slug: 'poughkeepsie', state: 'NY', country: 'United States' },
  { city: 'Saratoga', slug: 'saratoga', state: 'NY', country: 'United States' },
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
  { city: 'Glendale', slug: 'glendale', state: 'CA', country: 'United States' },
  { city: 'Burbank', slug: 'burbank', state: 'CA', country: 'United States' },
  { city: 'Sherman Oaks', slug: 'shermanoaks', state: 'CA', country: 'United States' },
  { city: 'Studio City', slug: 'studiocity', state: 'CA', country: 'United States' },
  { city: 'Woodland Hills', slug: 'woodlandhills', state: 'CA', country: 'United States' },
  { city: 'Westlake Village', slug: 'westlakevillage', state: 'CA', country: 'United States' },
  { city: 'Thousand Oaks', slug: 'thousandoaks', state: 'CA', country: 'United States' },
  { city: 'Agoura Hills', slug: 'agourahills', state: 'CA', country: 'United States' },
  { city: 'Hancock Park', slug: 'hancockpark', state: 'CA', country: 'United States' },
  { city: 'Culver City', slug: 'culvercity', state: 'CA', country: 'United States' },
  { city: 'Venice', slug: 'venice', state: 'CA', country: 'United States' },
  { city: 'Marina Del Rey', slug: 'marinadelrey', state: 'CA', country: 'United States' },
  { city: 'West Hollywood', slug: 'westhollywood', state: 'CA', country: 'United States' },
  { city: 'Hollywood', slug: 'hollywood', state: 'CA', country: 'United States' },
  { city: 'Redondo Beach', slug: 'redondobeach', state: 'CA', country: 'United States' },
  { city: 'Manhattan Beach', slug: 'manhattanbeach', state: 'CA', country: 'United States' },
  { city: 'Hermosa Beach', slug: 'hermosabeach', state: 'CA', country: 'United States' },
  { city: 'Torrance', slug: 'torrance', state: 'CA', country: 'United States' },
  { city: 'Long Beach', slug: 'longbeach', state: 'CA', country: 'United States' },
  { city: 'San Diego', slug: 'sandiego', state: 'CA', country: 'United States' },
  { city: 'La Jolla', slug: 'lajolla', state: 'CA', country: 'United States' },
  { city: 'Del Mar', slug: 'delmar', state: 'CA', country: 'United States' },
  { city: 'Carlsbad', slug: 'carlsbad', state: 'CA', country: 'United States' },
  { city: 'Encinitas', slug: 'encinitas', state: 'CA', country: 'United States' },
  { city: 'San Francisco', slug: 'sanfrancisco', state: 'CA', country: 'United States' },
  { city: 'San Jose', slug: 'sanjose', state: 'CA', country: 'United States' },
  { city: 'Palo Alto', slug: 'paloalto', state: 'CA', country: 'United States' },
  { city: 'Mountain View', slug: 'mountainview', state: 'CA', country: 'United States' },
  { city: 'Sunnyvale', slug: 'sunnyvale', state: 'CA', country: 'United States' },
  { city: 'Cupertino', slug: 'cupertino', state: 'CA', country: 'United States' },
  { city: 'Santa Clara', slug: 'santaclara', state: 'CA', country: 'United States' },
  { city: 'Fremont', slug: 'fremont', state: 'CA', country: 'United States' },
  { city: 'Pleasanton', slug: 'pleasanton', state: 'CA', country: 'United States' },
  { city: 'Walnut Creek', slug: 'walnutcreek', state: 'CA', country: 'United States' },
  { city: 'Sacramento', slug: 'sacramento', state: 'CA', country: 'United States' },
  { city: 'Irvine', slug: 'irvine', state: 'CA', country: 'United States' },
  { city: 'Newport Beach', slug: 'newportbeach', state: 'CA', country: 'United States' },
  { city: 'Laguna Beach', slug: 'lagunabeach', state: 'CA', country: 'United States' },
  { city: 'Laguna Niguel', slug: 'lagunaniguel', state: 'CA', country: 'United States' },
  { city: 'Mission Viejo', slug: 'missionviejo', state: 'CA', country: 'United States' },
  { city: 'Costa Mesa', slug: 'costamesa', state: 'CA', country: 'United States' },
  { city: 'Huntington Beach', slug: 'huntingtonbeach', state: 'CA', country: 'United States' },
  { city: 'Anaheim', slug: 'anaheim', state: 'CA', country: 'United States' },
  { city: 'Fullerton', slug: 'fullerton', state: 'CA', country: 'United States' },
  { city: 'Yorba Linda', slug: 'yorbalinda', state: 'CA', country: 'United States' },
  { city: 'Berkeley', slug: 'berkeley', state: 'CA', country: 'United States' },
  { city: 'Marin', slug: 'marin', state: 'CA', country: 'United States' },
  { city: 'Oakland', slug: 'oakland', state: 'CA', country: 'United States' },
  { city: 'Rancho Mirage', slug: 'ranchomirage', state: 'CA', country: 'United States' },
  { city: 'Palm Springs', slug: 'palmsprings', state: 'CA', country: 'United States' },
  { city: 'Palm Desert', slug: 'palmdesert', state: 'CA', country: 'United States' },
  { city: 'Rancho Santa Fe', slug: 'ranchosantafe', state: 'CA', country: 'United States' },
  { city: 'Santa Barbara', slug: 'santabarbara', state: 'CA', country: 'United States' },
  { city: 'San Luis Obispo', slug: 'sanluisobispo', state: 'CA', country: 'United States' },
  { city: 'Santa Cruz', slug: 'santacruz', state: 'CA', country: 'United States' },
  { city: 'Monterey', slug: 'monterey', state: 'CA', country: 'United States' },
  { city: 'Fresno', slug: 'fresno', state: 'CA', country: 'United States' },
  { city: 'Bakersfield', slug: 'bakersfield', state: 'CA', country: 'United States' },
  { city: 'Riverside', slug: 'riverside', state: 'CA', country: 'United States' },
  { city: 'Temecula', slug: 'temecula', state: 'CA', country: 'United States' },
  { city: 'Rancho Cucamonga', slug: 'ranchocucamonga', state: 'CA', country: 'United States' },
  // Florida
  { city: 'Miami', slug: 'miami', state: 'FL', country: 'United States' },
  { city: 'Miami Beach', slug: 'miamibeach', state: 'FL', country: 'United States' },
  { city: 'South Beach', slug: 'southbeach', state: 'FL', country: 'United States' },
  { city: 'North Miami Beach', slug: 'northmiamibeach', state: 'FL', country: 'United States' },
  { city: 'Aventura', slug: 'aventura', state: 'FL', country: 'United States' },
  { city: 'Sunny Isles', slug: 'sunnyisles', state: 'FL', country: 'United States' },
  { city: 'Bal Harbour', slug: 'balharbour', state: 'FL', country: 'United States' },
  { city: 'Surfside', slug: 'surfside', state: 'FL', country: 'United States' },
  { city: 'Hallandale', slug: 'hallandale', state: 'FL', country: 'United States' },
  { city: 'Fort Lauderdale', slug: 'fortlauderdale', state: 'FL', country: 'United States' },
  { city: 'Boca Raton', slug: 'bocaraton', state: 'FL', country: 'United States' },
  { city: 'Palm Beach', slug: 'palmbeach', state: 'FL', country: 'United States' },
  { city: 'West Palm Beach', slug: 'westpalmbeach', state: 'FL', country: 'United States' },
  { city: 'Palm Beach Gardens', slug: 'palmbeachgardens', state: 'FL', country: 'United States' },
  { city: 'Jupiter', slug: 'jupiter', state: 'FL', country: 'United States' },
  { city: 'Delray Beach', slug: 'delraybeach', state: 'FL', country: 'United States' },
  { city: 'Boynton Beach', slug: 'boyntonbeach', state: 'FL', country: 'United States' },
  { city: 'Deerfield Beach', slug: 'deerfieldbeach', state: 'FL', country: 'United States' },
  { city: 'Pompano Beach', slug: 'pompanobeach', state: 'FL', country: 'United States' },
  { city: 'Weston', slug: 'weston', state: 'FL', country: 'United States' },
  { city: 'Plantation', slug: 'plantation', state: 'FL', country: 'United States' },
  { city: 'Coral Springs', slug: 'coralsprings', state: 'FL', country: 'United States' },
  { city: 'Parkland', slug: 'parkland', state: 'FL', country: 'United States' },
  { city: 'Davie', slug: 'davie', state: 'FL', country: 'United States' },
  { city: 'Pembroke Pines', slug: 'pembrokepines', state: 'FL', country: 'United States' },
  { city: 'Hollywood', slug: 'hollywoodfl', state: 'FL', country: 'United States' },
  { city: 'Cooper City', slug: 'coopercity', state: 'FL', country: 'United States' },
  { city: 'Coral Gables', slug: 'coralgables', state: 'FL', country: 'United States' },
  { city: 'Coconut Grove', slug: 'coconutgrove', state: 'FL', country: 'United States' },
  { city: 'Kendall', slug: 'kendall', state: 'FL', country: 'United States' },
  { city: 'Doral', slug: 'doral', state: 'FL', country: 'United States' },
  { city: 'Key Biscayne', slug: 'keybiscayne', state: 'FL', country: 'United States' },
  { city: 'Orlando', slug: 'orlando', state: 'FL', country: 'United States' },
  { city: 'Tampa', slug: 'tampa', state: 'FL', country: 'United States' },
  { city: 'St Petersburg', slug: 'stpetersburg', state: 'FL', country: 'United States' },
  { city: 'Clearwater', slug: 'clearwater', state: 'FL', country: 'United States' },
  { city: 'Jacksonville', slug: 'jacksonville', state: 'FL', country: 'United States' },
  { city: 'Naples', slug: 'naples', state: 'FL', country: 'United States' },
  { city: 'Sarasota', slug: 'sarasota', state: 'FL', country: 'United States' },
  { city: 'Fort Myers', slug: 'fortmyers', state: 'FL', country: 'United States' },
  { city: 'Tallahassee', slug: 'tallahassee', state: 'FL', country: 'United States' },
  { city: 'Gainesville', slug: 'gainesville', state: 'FL', country: 'United States' },
  { city: 'Key West', slug: 'keywest', state: 'FL', country: 'United States' },
  // Texas
  { city: 'Houston', slug: 'houston', state: 'TX', country: 'United States' },
  { city: 'Dallas', slug: 'dallas', state: 'TX', country: 'United States' },
  { city: 'Austin', slug: 'austin', state: 'TX', country: 'United States' },
  { city: 'San Antonio', slug: 'sanantonio', state: 'TX', country: 'United States' },
  { city: 'Plano', slug: 'plano', state: 'TX', country: 'United States' },
  { city: 'Frisco', slug: 'frisco', state: 'TX', country: 'United States' },
  { city: 'Sugar Land', slug: 'sugarland', state: 'TX', country: 'United States' },
  { city: 'El Paso', slug: 'elpaso', state: 'TX', country: 'United States' },
  { city: 'Fort Worth', slug: 'fortworth', state: 'TX', country: 'United States' },
  { city: 'The Woodlands', slug: 'thewoodlands', state: 'TX', country: 'United States' },
  { city: 'Katy', slug: 'katy', state: 'TX', country: 'United States' },
  { city: 'Southlake', slug: 'southlake', state: 'TX', country: 'United States' },
  { city: 'McKinney', slug: 'mckinney', state: 'TX', country: 'United States' },
  { city: 'Allen', slug: 'allen', state: 'TX', country: 'United States' },
  // Illinois
  { city: 'Chicago', slug: 'chicago', state: 'IL', country: 'United States' },
  { city: 'Evanston', slug: 'evanston', state: 'IL', country: 'United States' },
  { city: 'Skokie', slug: 'skokie', state: 'IL', country: 'United States' },
  { city: 'Lincoln Park', slug: 'lincolnpark', state: 'IL', country: 'United States' },
  { city: 'Lakeview', slug: 'lakeview', state: 'IL', country: 'United States' },
  { city: 'Highland Park', slug: 'highlandpark', state: 'IL', country: 'United States' },
  { city: 'Naperville', slug: 'naperville', state: 'IL', country: 'United States' },
  { city: 'Deerfield', slug: 'deerfield', state: 'IL', country: 'United States' },
  { city: 'Northbrook', slug: 'northbrook', state: 'IL', country: 'United States' },
  { city: 'Wilmette', slug: 'wilmette', state: 'IL', country: 'United States' },
  { city: 'Glencoe', slug: 'glencoe', state: 'IL', country: 'United States' },
  { city: 'Buffalo Grove', slug: 'buffalogrove', state: 'IL', country: 'United States' },
  { city: 'Schaumburg', slug: 'schaumburg', state: 'IL', country: 'United States' },
  { city: 'Vernon Hills', slug: 'vernonhills', state: 'IL', country: 'United States' },
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
  { city: 'Englewood', slug: 'englewood', state: 'NJ', country: 'United States' },
  { city: 'Fort Lee', slug: 'fortlee', state: 'NJ', country: 'United States' },
  { city: 'Hackensack', slug: 'hackensack', state: 'NJ', country: 'United States' },
  { city: 'Paramus', slug: 'paramus', state: 'NJ', country: 'United States' },
  { city: 'Wayne', slug: 'wayne', state: 'NJ', country: 'United States' },
  { city: 'Randolph', slug: 'randolph', state: 'NJ', country: 'United States' },
  { city: 'Basking Ridge', slug: 'baskingridge', state: 'NJ', country: 'United States' },
  { city: 'Short Hills', slug: 'shorthills', state: 'NJ', country: 'United States' },
  { city: 'Summit', slug: 'summit', state: 'NJ', country: 'United States' },
  { city: 'Westfield', slug: 'westfield', state: 'NJ', country: 'United States' },
  { city: 'Edison', slug: 'edison', state: 'NJ', country: 'United States' },
  { city: 'New Brunswick', slug: 'newbrunswick', state: 'NJ', country: 'United States' },
  { city: 'Highland Park', slug: 'highlandparknj', state: 'NJ', country: 'United States' },
  { city: 'Marlboro', slug: 'marlboro', state: 'NJ', country: 'United States' },
  { city: 'Manalapan', slug: 'manalapan', state: 'NJ', country: 'United States' },
  // Massachusetts
  { city: 'Boston', slug: 'boston', state: 'MA', country: 'United States' },
  { city: 'Cambridge', slug: 'cambridge', state: 'MA', country: 'United States' },
  { city: 'Brookline', slug: 'brookline', state: 'MA', country: 'United States' },
  { city: 'Newton', slug: 'newton', state: 'MA', country: 'United States' },
  { city: 'Wellesley', slug: 'wellesley', state: 'MA', country: 'United States' },
  { city: 'Needham', slug: 'needham', state: 'MA', country: 'United States' },
  { city: 'Lexington', slug: 'lexington', state: 'MA', country: 'United States' },
  { city: 'Natick', slug: 'natick', state: 'MA', country: 'United States' },
  { city: 'Framingham', slug: 'framingham', state: 'MA', country: 'United States' },
  { city: 'Worcester', slug: 'worcester', state: 'MA', country: 'United States' },
  { city: 'Springfield', slug: 'springfield', state: 'MA', country: 'United States' },
  { city: 'Amherst', slug: 'amherst', state: 'MA', country: 'United States' },
  { city: 'Cape Cod', slug: 'capecod', state: 'MA', country: 'United States' },
  { city: 'Martha Vineyard', slug: 'marthasvineyard', state: 'MA', country: 'United States' },
  { city: 'Nantucket', slug: 'nantucket', state: 'MA', country: 'United States' },
  // Pennsylvania
  { city: 'Philadelphia', slug: 'philadelphia', state: 'PA', country: 'United States' },
  { city: 'Pittsburgh', slug: 'pittsburgh', state: 'PA', country: 'United States' },
  { city: 'Main Line', slug: 'mainline', state: 'PA', country: 'United States' },
  { city: 'Bala Cynwyd', slug: 'balacynwyd', state: 'PA', country: 'United States' },
  { city: 'Wynnewood', slug: 'wynnewood', state: 'PA', country: 'United States' },
  { city: 'Elkins Park', slug: 'elkinspark', state: 'PA', country: 'United States' },
  { city: 'King of Prussia', slug: 'kingofprussia', state: 'PA', country: 'United States' },
  { city: 'Harrisburg', slug: 'harrisburg', state: 'PA', country: 'United States' },
  { city: 'State College', slug: 'statecollege', state: 'PA', country: 'United States' },
  // Maryland / DC / Virginia
  { city: 'Baltimore', slug: 'baltimore', state: 'MD', country: 'United States' },
  { city: 'Bethesda', slug: 'bethesda', state: 'MD', country: 'United States' },
  { city: 'Rockville', slug: 'rockville', state: 'MD', country: 'United States' },
  { city: 'Silver Spring', slug: 'silverspring', state: 'MD', country: 'United States' },
  { city: 'Potomac', slug: 'potomac', state: 'MD', country: 'United States' },
  { city: 'Columbia', slug: 'columbiamd', state: 'MD', country: 'United States' },
  { city: 'Annapolis', slug: 'annapolis', state: 'MD', country: 'United States' },
  { city: 'Washington DC', slug: 'dc', state: 'DC', country: 'United States' },
  { city: 'Georgetown', slug: 'georgetown', state: 'DC', country: 'United States' },
  { city: 'Dupont Circle', slug: 'dupontcircle', state: 'DC', country: 'United States' },
  { city: 'Richmond', slug: 'richmond', state: 'VA', country: 'United States' },
  { city: 'Fairfax', slug: 'fairfax', state: 'VA', country: 'United States' },
  { city: 'Charlottesville', slug: 'charlottesville', state: 'VA', country: 'United States' },
  { city: 'Arlington', slug: 'arlington', state: 'VA', country: 'United States' },
  { city: 'Tysons', slug: 'tysons', state: 'VA', country: 'United States' },
  { city: 'Alexandria', slug: 'alexandria', state: 'VA', country: 'United States' },
  { city: 'McLean', slug: 'mclean', state: 'VA', country: 'United States' },
  { city: 'Norfolk', slug: 'norfolk', state: 'VA', country: 'United States' },
  { city: 'Virginia Beach', slug: 'virginiabeach', state: 'VA', country: 'United States' },
  // Connecticut
  { city: 'Westport', slug: 'westport', state: 'CT', country: 'United States' },
  { city: 'Stamford', slug: 'stamford', state: 'CT', country: 'United States' },
  { city: 'New Haven', slug: 'newhaven', state: 'CT', country: 'United States' },
  { city: 'Greenwich', slug: 'greenwich', state: 'CT', country: 'United States' },
  { city: 'Fairfield', slug: 'fairfield', state: 'CT', country: 'United States' },
  { city: 'Hartford', slug: 'hartford', state: 'CT', country: 'United States' },
  { city: 'West Hartford', slug: 'westhartford', state: 'CT', country: 'United States' },
  { city: 'New London', slug: 'newlondon', state: 'CT', country: 'United States' },
  { city: 'Glastonbury', slug: 'glastonbury', state: 'CT', country: 'United States' },
  // Southeast
  { city: 'Atlanta', slug: 'atlanta', state: 'GA', country: 'United States' },
  { city: 'Savannah', slug: 'savannah', state: 'GA', country: 'United States' },
  { city: 'Alpharetta', slug: 'alpharetta', state: 'GA', country: 'United States' },
  { city: 'Buckhead', slug: 'buckhead', state: 'GA', country: 'United States' },
  { city: 'Dunwoody', slug: 'dunwoody', state: 'GA', country: 'United States' },
  { city: 'Marietta', slug: 'marietta', state: 'GA', country: 'United States' },
  { city: 'Charlotte', slug: 'charlotte', state: 'NC', country: 'United States' },
  { city: 'Raleigh', slug: 'raleigh', state: 'NC', country: 'United States' },
  { city: 'Durham', slug: 'durham', state: 'NC', country: 'United States' },
  { city: 'Chapel Hill', slug: 'chapelhill', state: 'NC', country: 'United States' },
  { city: 'Asheville', slug: 'asheville', state: 'NC', country: 'United States' },
  { city: 'Wilmington', slug: 'wilmington', state: 'NC', country: 'United States' },
  { city: 'Charleston', slug: 'charleston', state: 'SC', country: 'United States' },
  { city: 'Greenville', slug: 'greenville', state: 'SC', country: 'United States' },
  { city: 'Nashville', slug: 'nashville', state: 'TN', country: 'United States' },
  { city: 'Memphis', slug: 'memphis', state: 'TN', country: 'United States' },
  { city: 'Knoxville', slug: 'knoxville', state: 'TN', country: 'United States' },
  { city: 'Birmingham', slug: 'birminghamal', state: 'AL', country: 'United States' },
  { city: 'New Orleans', slug: 'neworleans', state: 'LA', country: 'United States' },
  { city: 'Baton Rouge', slug: 'batonrouge', state: 'LA', country: 'United States' },
  { city: 'Little Rock', slug: 'littlerock', state: 'AR', country: 'United States' },
  { city: 'Jackson', slug: 'jackson', state: 'MS', country: 'United States' },
  // Southwest
  { city: 'Scottsdale', slug: 'scottsdale', state: 'AZ', country: 'United States' },
  { city: 'Phoenix', slug: 'phoenix', state: 'AZ', country: 'United States' },
  { city: 'Tucson', slug: 'tucson', state: 'AZ', country: 'United States' },
  { city: 'Chandler', slug: 'chandler', state: 'AZ', country: 'United States' },
  { city: 'Paradise Valley', slug: 'paradisevalley', state: 'AZ', country: 'United States' },
  { city: 'Tempe', slug: 'tempe', state: 'AZ', country: 'United States' },
  { city: 'Mesa', slug: 'mesa', state: 'AZ', country: 'United States' },
  { city: 'Sedona', slug: 'sedona', state: 'AZ', country: 'United States' },
  { city: 'Flagstaff', slug: 'flagstaff', state: 'AZ', country: 'United States' },
  { city: 'Las Vegas', slug: 'lasvegas', state: 'NV', country: 'United States' },
  { city: 'Henderson', slug: 'henderson', state: 'NV', country: 'United States' },
  { city: 'Summerlin', slug: 'summerlin', state: 'NV', country: 'United States' },
  { city: 'Reno', slug: 'reno', state: 'NV', country: 'United States' },
  { city: 'Albuquerque', slug: 'albuquerque', state: 'NM', country: 'United States' },
  { city: 'Santa Fe', slug: 'santafe', state: 'NM', country: 'United States' },
  // Mountain / West
  { city: 'Denver', slug: 'denver', state: 'CO', country: 'United States' },
  { city: 'Boulder', slug: 'boulder', state: 'CO', country: 'United States' },
  { city: 'Aspen', slug: 'aspen', state: 'CO', country: 'United States' },
  { city: 'Vail', slug: 'vail', state: 'CO', country: 'United States' },
  { city: 'Colorado Springs', slug: 'coloradosprings', state: 'CO', country: 'United States' },
  { city: 'Fort Collins', slug: 'fortcollins', state: 'CO', country: 'United States' },
  { city: 'Salt Lake City', slug: 'saltlakecity', state: 'UT', country: 'United States' },
  { city: 'Park City', slug: 'parkcity', state: 'UT', country: 'United States' },
  { city: 'Boise', slug: 'boise', state: 'ID', country: 'United States' },
  { city: 'Jackson Hole', slug: 'jacksonhole', state: 'WY', country: 'United States' },
  // Pacific Northwest
  { city: 'Seattle', slug: 'seattle', state: 'WA', country: 'United States' },
  { city: 'Bellevue', slug: 'bellevue', state: 'WA', country: 'United States' },
  { city: 'Mercer Island', slug: 'mercerisland', state: 'WA', country: 'United States' },
  { city: 'Kirkland', slug: 'kirkland', state: 'WA', country: 'United States' },
  { city: 'Redmond', slug: 'redmond', state: 'WA', country: 'United States' },
  { city: 'Issaquah', slug: 'issaquah', state: 'WA', country: 'United States' },
  { city: 'Olympia', slug: 'olympia', state: 'WA', country: 'United States' },
  { city: 'Portland', slug: 'portland', state: 'OR', country: 'United States' },
  { city: 'Eugene', slug: 'eugene', state: 'OR', country: 'United States' },
  { city: 'Bend', slug: 'bend', state: 'OR', country: 'United States' },
  // Midwest
  { city: 'Ann Arbor', slug: 'annarbor', state: 'MI', country: 'United States' },
  { city: 'Detroit', slug: 'detroit', state: 'MI', country: 'United States' },
  { city: 'West Bloomfield', slug: 'westbloomfield', state: 'MI', country: 'United States' },
  { city: 'Farmington Hills', slug: 'farmingtonhills', state: 'MI', country: 'United States' },
  { city: 'Grand Rapids', slug: 'grandrapids', state: 'MI', country: 'United States' },
  { city: 'East Lansing', slug: 'eastlansing', state: 'MI', country: 'United States' },
  { city: 'Cleveland', slug: 'cleveland', state: 'OH', country: 'United States' },
  { city: 'Columbus', slug: 'columbus', state: 'OH', country: 'United States' },
  { city: 'Cincinnati', slug: 'cincinnati', state: 'OH', country: 'United States' },
  { city: 'Beachwood', slug: 'beachwood', state: 'OH', country: 'United States' },
  { city: 'Dayton', slug: 'dayton', state: 'OH', country: 'United States' },
  { city: 'Minneapolis', slug: 'minneapolis', state: 'MN', country: 'United States' },
  { city: 'St Paul', slug: 'stpaul', state: 'MN', country: 'United States' },
  { city: 'St Louis', slug: 'stlouis', state: 'MO', country: 'United States' },
  { city: 'Kansas City', slug: 'kansascity', state: 'MO', country: 'United States' },
  { city: 'Indianapolis', slug: 'indianapolis', state: 'IN', country: 'United States' },
  { city: 'Milwaukee', slug: 'milwaukee', state: 'WI', country: 'United States' },
  { city: 'Madison', slug: 'madison', state: 'WI', country: 'United States' },
  { city: 'Omaha', slug: 'omaha', state: 'NE', country: 'United States' },
  { city: 'Des Moines', slug: 'desmoines', state: 'IA', country: 'United States' },
  { city: 'Iowa City', slug: 'iowacity', state: 'IA', country: 'United States' },
  { city: 'Oklahoma City', slug: 'oklahomacity', state: 'OK', country: 'United States' },
  { city: 'Tulsa', slug: 'tulsa', state: 'OK', country: 'United States' },
  { city: 'Wichita', slug: 'wichita', state: 'KS', country: 'United States' },
  // Hawaii & Alaska
  { city: 'Hawaii', slug: 'hawaii', state: 'HI', country: 'United States' },
  { city: 'Honolulu', slug: 'honolulu', state: 'HI', country: 'United States' },
  { city: 'Maui', slug: 'maui', state: 'HI', country: 'United States' },
  { city: 'Kauai', slug: 'kauai', state: 'HI', country: 'United States' },
  { city: 'Big Island', slug: 'bigisland', state: 'HI', country: 'United States' },
  { city: 'Anchorage', slug: 'anchorage', state: 'AK', country: 'United States' },
  // Other states (state-level)
  { city: 'Delaware', slug: 'delaware', state: 'DE', country: 'United States' },
  { city: 'Rhode Island', slug: 'rhodeisland', state: 'RI', country: 'United States' },
  { city: 'Providence', slug: 'providence', state: 'RI', country: 'United States' },
  { city: 'Vermont', slug: 'vermont', state: 'VT', country: 'United States' },
  { city: 'Burlington', slug: 'burlington', state: 'VT', country: 'United States' },
  { city: 'New Hampshire', slug: 'newhampshire', state: 'NH', country: 'United States' },
  { city: 'Maine', slug: 'maine', state: 'ME', country: 'United States' },
  { city: 'Portland', slug: 'portlandme', state: 'ME', country: 'United States' },
  { city: 'Montana', slug: 'montana', state: 'MT', country: 'United States' },
  { city: 'North Dakota', slug: 'northdakota', state: 'ND', country: 'United States' },
  { city: 'South Dakota', slug: 'southdakota', state: 'SD', country: 'United States' },

  // ===================== CANADA =====================
  { city: 'Toronto', slug: 'toronto', state: 'ON', country: 'Canada' },
  { city: 'Downtown Toronto', slug: 'downtowntoronto', state: 'ON', country: 'Canada' },
  { city: 'North York', slug: 'northyork', state: 'ON', country: 'Canada' },
  { city: 'Thornhill', slug: 'thornhill', state: 'ON', country: 'Canada' },
  { city: 'Markham', slug: 'markham', state: 'ON', country: 'Canada' },
  { city: 'Richmond Hill', slug: 'richmondhill', state: 'ON', country: 'Canada' },
  { city: 'Vaughan', slug: 'vaughan', state: 'ON', country: 'Canada' },
  { city: 'Mississauga', slug: 'mississauga', state: 'ON', country: 'Canada' },
  { city: 'Hamilton', slug: 'hamiltonca', state: 'ON', country: 'Canada' },
  { city: 'Waterloo', slug: 'waterlooca', state: 'ON', country: 'Canada' },
  { city: 'London', slug: 'londonon', state: 'ON', country: 'Canada' },
  { city: 'Kingston', slug: 'kingston', state: 'ON', country: 'Canada' },
  { city: 'Ottawa', slug: 'ottawa', state: 'ON', country: 'Canada' },
  { city: 'Montreal', slug: 'montreal', state: 'QC', country: 'Canada' },
  { city: 'Cote Saint Luc', slug: 'cotesaintluc', state: 'QC', country: 'Canada' },
  { city: 'Westmount', slug: 'westmount', state: 'QC', country: 'Canada' },
  { city: 'Laval', slug: 'laval', state: 'QC', country: 'Canada' },
  { city: 'Quebec City', slug: 'quebeccity', state: 'QC', country: 'Canada' },
  { city: 'Vancouver', slug: 'vancouver', state: 'BC', country: 'Canada' },
  { city: 'West Vancouver', slug: 'westvancouver', state: 'BC', country: 'Canada' },
  { city: 'North Vancouver', slug: 'northvancouver', state: 'BC', country: 'Canada' },
  { city: 'Victoria', slug: 'victoriaca', state: 'BC', country: 'Canada' },
  { city: 'Kelowna', slug: 'kelowna', state: 'BC', country: 'Canada' },
  { city: 'Whistler', slug: 'whistler', state: 'BC', country: 'Canada' },
  { city: 'Calgary', slug: 'calgary', state: 'AB', country: 'Canada' },
  { city: 'Edmonton', slug: 'edmonton', state: 'AB', country: 'Canada' },
  { city: 'Winnipeg', slug: 'winnipeg', state: 'MB', country: 'Canada' },
  { city: 'Halifax', slug: 'halifax', state: 'NS', country: 'Canada' },
  { city: 'Saskatoon', slug: 'saskatoon', state: 'SK', country: 'Canada' },
  { city: 'Regina', slug: 'regina', state: 'SK', country: 'Canada' },
  { city: 'St Johns', slug: 'stjohns', state: 'NL', country: 'Canada' },

  // ===================== UNITED KINGDOM =====================
  { city: 'London', slug: 'london', state: '', country: 'United Kingdom' },
  { city: 'Central London', slug: 'centrallondon', state: '', country: 'United Kingdom' },
  { city: 'North London', slug: 'northlondon', state: '', country: 'United Kingdom' },
  { city: 'South London', slug: 'southlondon', state: '', country: 'United Kingdom' },
  { city: 'East London', slug: 'eastlondon', state: '', country: 'United Kingdom' },
  { city: 'West London', slug: 'westlondon', state: '', country: 'United Kingdom' },
  { city: 'Golders Green', slug: 'goldersgreen', state: '', country: 'United Kingdom' },
  { city: 'Hampstead', slug: 'hampstead', state: '', country: 'United Kingdom' },
  { city: 'Hendon', slug: 'hendon', state: '', country: 'United Kingdom' },
  { city: 'Edgware', slug: 'edgware', state: '', country: 'United Kingdom' },
  { city: 'Stanmore', slug: 'stanmore', state: '', country: 'United Kingdom' },
  { city: 'Barnet', slug: 'barnet', state: '', country: 'United Kingdom' },
  { city: 'Canary Wharf', slug: 'canarywharf', state: '', country: 'United Kingdom' },
  { city: 'Kensington', slug: 'kensington', state: '', country: 'United Kingdom' },
  { city: 'Knightsbridge', slug: 'knightsbridge', state: '', country: 'United Kingdom' },
  { city: 'Mayfair', slug: 'mayfair', state: '', country: 'United Kingdom' },
  { city: 'Ilford', slug: 'ilford', state: '', country: 'United Kingdom' },
  { city: 'Redbridge', slug: 'redbridge', state: '', country: 'United Kingdom' },
  { city: 'Manchester', slug: 'manchester', state: '', country: 'United Kingdom' },
  { city: 'Prestwich', slug: 'prestwich', state: '', country: 'United Kingdom' },
  { city: 'Salford', slug: 'salford', state: '', country: 'United Kingdom' },
  { city: 'Whitefield', slug: 'whitefield', state: '', country: 'United Kingdom' },
  { city: 'Leeds', slug: 'leeds', state: '', country: 'United Kingdom' },
  { city: 'Birmingham', slug: 'birminghamuk', state: '', country: 'United Kingdom' },
  { city: 'Edinburgh', slug: 'edinburgh', state: '', country: 'United Kingdom' },
  { city: 'Glasgow', slug: 'glasgow', state: '', country: 'United Kingdom' },
  { city: 'Oxford', slug: 'oxford', state: '', country: 'United Kingdom' },
  { city: 'Cambridge', slug: 'cambridgeuk', state: '', country: 'United Kingdom' },
  { city: 'Brighton', slug: 'brighton', state: '', country: 'United Kingdom' },
  { city: 'Liverpool', slug: 'liverpool', state: '', country: 'United Kingdom' },
  { city: 'Bristol', slug: 'bristol', state: '', country: 'United Kingdom' },
  { city: 'Nottingham', slug: 'nottingham', state: '', country: 'United Kingdom' },
  { city: 'Sheffield', slug: 'sheffield', state: '', country: 'United Kingdom' },
  { city: 'Cardiff', slug: 'cardiff', state: '', country: 'United Kingdom' },
  { city: 'Belfast', slug: 'belfast', state: '', country: 'United Kingdom' },
  { city: 'Newcastle', slug: 'newcastle', state: '', country: 'United Kingdom' },
  { city: 'Bournemouth', slug: 'bournemouth', state: '', country: 'United Kingdom' },
  { city: 'Southampton', slug: 'southampton', state: '', country: 'United Kingdom' },
  { city: 'Gateshead', slug: 'gateshead', state: '', country: 'United Kingdom' },

  // ===================== AUSTRALIA =====================
  { city: 'Sydney', slug: 'sydney', state: 'NSW', country: 'Australia' },
  { city: 'North Sydney', slug: 'northsydney', state: 'NSW', country: 'Australia' },
  { city: 'Eastern Suburbs', slug: 'easternsuburbs', state: 'NSW', country: 'Australia' },
  { city: 'Bondi', slug: 'bondi', state: 'NSW', country: 'Australia' },
  { city: 'Double Bay', slug: 'doublebay', state: 'NSW', country: 'Australia' },
  { city: 'Dover Heights', slug: 'doverheights', state: 'NSW', country: 'Australia' },
  { city: 'Rose Bay', slug: 'rosebay', state: 'NSW', country: 'Australia' },
  { city: 'Vaucluse', slug: 'vaucluse', state: 'NSW', country: 'Australia' },
  { city: 'Melbourne', slug: 'melbourne', state: 'VIC', country: 'Australia' },
  { city: 'St Kilda', slug: 'stkilda', state: 'VIC', country: 'Australia' },
  { city: 'Caulfield', slug: 'caulfield', state: 'VIC', country: 'Australia' },
  { city: 'Elsternwick', slug: 'elsternwick', state: 'VIC', country: 'Australia' },
  { city: 'Brighton', slug: 'brightonau', state: 'VIC', country: 'Australia' },
  { city: 'Bentleigh', slug: 'bentleigh', state: 'VIC', country: 'Australia' },
  { city: 'Brisbane', slug: 'brisbane', state: 'QLD', country: 'Australia' },
  { city: 'Gold Coast', slug: 'goldcoast', state: 'QLD', country: 'Australia' },
  { city: 'Surfers Paradise', slug: 'surfersparadise', state: 'QLD', country: 'Australia' },
  { city: 'Sunshine Coast', slug: 'sunshinecoast', state: 'QLD', country: 'Australia' },
  { city: 'Perth', slug: 'perth', state: 'WA', country: 'Australia' },
  { city: 'Adelaide', slug: 'adelaide', state: 'SA', country: 'Australia' },
  { city: 'Canberra', slug: 'canberra', state: 'ACT', country: 'Australia' },
  { city: 'Hobart', slug: 'hobart', state: 'TAS', country: 'Australia' },

  // ===================== SOUTH AFRICA =====================
  { city: 'Cape Town', slug: 'capetown', state: '', country: 'South Africa' },
  { city: 'Sea Point', slug: 'seapoint', state: '', country: 'South Africa' },
  { city: 'Gardens', slug: 'gardens', state: '', country: 'South Africa' },
  { city: 'Johannesburg', slug: 'johannesburg', state: '', country: 'South Africa' },
  { city: 'Sandton', slug: 'sandton', state: '', country: 'South Africa' },
  { city: 'Norwood', slug: 'norwood', state: '', country: 'South Africa' },
  { city: 'Glenhazel', slug: 'glenhazel', state: '', country: 'South Africa' },
  { city: 'Durban', slug: 'durban', state: '', country: 'South Africa' },
  { city: 'Pretoria', slug: 'pretoria', state: '', country: 'South Africa' },
  { city: 'Port Elizabeth', slug: 'portelizabeth', state: '', country: 'South Africa' },

  // ===================== NEW ZEALAND =====================
  { city: 'Auckland', slug: 'auckland', state: '', country: 'New Zealand' },
  { city: 'Wellington', slug: 'wellington', state: '', country: 'New Zealand' },
  { city: 'Christchurch', slug: 'christchurch', state: '', country: 'New Zealand' },
  { city: 'Queenstown', slug: 'queenstown', state: '', country: 'New Zealand' },

  // ===================== ISRAEL =====================
  { city: 'Tel Aviv', slug: 'telaviv', state: '', country: 'Israel' },
  { city: 'Jerusalem', slug: 'jerusalem', state: '', country: 'Israel' },
  { city: 'Haifa', slug: 'haifa', state: '', country: 'Israel' },
  { city: 'Eilat', slug: 'eilat', state: '', country: 'Israel' },
  { city: 'Herzliya', slug: 'herzliya', state: '', country: 'Israel' },
  { city: 'Netanya', slug: 'netanya', state: '', country: 'Israel' },
  { city: 'Raanana', slug: 'raanana', state: '', country: 'Israel' },
  { city: 'Modiin', slug: 'modiin', state: '', country: 'Israel' },
  { city: 'Tiberias', slug: 'tiberias', state: '', country: 'Israel' },
  { city: 'Safed', slug: 'safed', state: '', country: 'Israel' },

  // ===================== GLOBAL (Non-English with Chabad presence) =====================
  // France
  { city: 'Paris', slug: 'paris', state: '', country: 'France' },
  { city: 'Nice', slug: 'nice', state: '', country: 'France' },
  { city: 'Marseille', slug: 'marseille', state: '', country: 'France' },
  { city: 'Lyon', slug: 'lyon', state: '', country: 'France' },
  { city: 'Cannes', slug: 'cannes', state: '', country: 'France' },
  { city: 'Strasbourg', slug: 'strasbourg', state: '', country: 'France' },
  // Germany
  { city: 'Berlin', slug: 'berlin', state: '', country: 'Germany' },
  { city: 'Munich', slug: 'munich', state: '', country: 'Germany' },
  { city: 'Frankfurt', slug: 'frankfurt', state: '', country: 'Germany' },
  { city: 'Hamburg', slug: 'hamburg', state: '', country: 'Germany' },
  { city: 'Dusseldorf', slug: 'dusseldorf', state: '', country: 'Germany' },
  // Other Europe
  { city: 'Amsterdam', slug: 'amsterdam', state: '', country: 'Netherlands' },
  { city: 'Antwerp', slug: 'antwerp', state: '', country: 'Belgium' },
  { city: 'Brussels', slug: 'brussels', state: '', country: 'Belgium' },
  { city: 'Zurich', slug: 'zurich', state: '', country: 'Switzerland' },
  { city: 'Geneva', slug: 'geneva', state: '', country: 'Switzerland' },
  { city: 'Vienna', slug: 'vienna', state: '', country: 'Austria' },
  { city: 'Prague', slug: 'prague', state: '', country: 'Czech Republic' },
  { city: 'Budapest', slug: 'budapest', state: '', country: 'Hungary' },
  { city: 'Warsaw', slug: 'warsaw', state: '', country: 'Poland' },
  { city: 'Krakow', slug: 'krakow', state: '', country: 'Poland' },
  { city: 'Rome', slug: 'rome', state: '', country: 'Italy' },
  { city: 'Milan', slug: 'milan', state: '', country: 'Italy' },
  { city: 'Florence', slug: 'florence', state: '', country: 'Italy' },
  { city: 'Venice', slug: 'veniceitaly', state: '', country: 'Italy' },
  { city: 'Madrid', slug: 'madrid', state: '', country: 'Spain' },
  { city: 'Barcelona', slug: 'barcelona', state: '', country: 'Spain' },
  { city: 'Lisbon', slug: 'lisbon', state: '', country: 'Portugal' },
  { city: 'Copenhagen', slug: 'copenhagen', state: '', country: 'Denmark' },
  { city: 'Stockholm', slug: 'stockholm', state: '', country: 'Sweden' },
  { city: 'Oslo', slug: 'oslo', state: '', country: 'Norway' },
  { city: 'Helsinki', slug: 'helsinki', state: '', country: 'Finland' },
  { city: 'Dublin', slug: 'dublin', state: '', country: 'Ireland' },
  { city: 'Moscow', slug: 'moscow', state: '', country: 'Russia' },
  { city: 'St Petersburg', slug: 'stpetersburgru', state: '', country: 'Russia' },
  { city: 'Kiev', slug: 'kiev', state: '', country: 'Ukraine' },
  { city: 'Odessa', slug: 'odessa', state: '', country: 'Ukraine' },
  { city: 'Dnipro', slug: 'dnipro', state: '', country: 'Ukraine' },
  { city: 'Bucharest', slug: 'bucharest', state: '', country: 'Romania' },
  { city: 'Athens', slug: 'athens', state: '', country: 'Greece' },
  { city: 'Istanbul', slug: 'istanbul', state: '', country: 'Turkey' },
  // Asia
  { city: 'Bangkok', slug: 'bangkok', state: '', country: 'Thailand' },
  { city: 'Chiang Mai', slug: 'chiangmai', state: '', country: 'Thailand' },
  { city: 'Phuket', slug: 'phuket', state: '', country: 'Thailand' },
  { city: 'Koh Samui', slug: 'kohsamui', state: '', country: 'Thailand' },
  { city: 'Tokyo', slug: 'tokyo', state: '', country: 'Japan' },
  { city: 'Seoul', slug: 'seoul', state: '', country: 'South Korea' },
  { city: 'Shanghai', slug: 'shanghai', state: '', country: 'China' },
  { city: 'Beijing', slug: 'beijing', state: '', country: 'China' },
  { city: 'Hong Kong', slug: 'hongkong', state: '', country: 'China' },
  { city: 'Singapore', slug: 'singapore', state: '', country: 'Singapore' },
  { city: 'Mumbai', slug: 'mumbai', state: '', country: 'India' },
  { city: 'New Delhi', slug: 'newdelhi', state: '', country: 'India' },
  { city: 'Goa', slug: 'goa', state: '', country: 'India' },
  { city: 'Kathmandu', slug: 'kathmandu', state: '', country: 'Nepal' },
  { city: 'Phnom Penh', slug: 'phnompenh', state: '', country: 'Cambodia' },
  { city: 'Hanoi', slug: 'hanoi', state: '', country: 'Vietnam' },
  { city: 'Bali', slug: 'bali', state: '', country: 'Indonesia' },
  // Americas
  { city: 'Mexico City', slug: 'mexicocity', state: '', country: 'Mexico' },
  { city: 'Cancun', slug: 'cancun', state: '', country: 'Mexico' },
  { city: 'Playa Del Carmen', slug: 'playadelcarmen', state: '', country: 'Mexico' },
  { city: 'Buenos Aires', slug: 'buenosaires', state: '', country: 'Argentina' },
  { city: 'Sao Paulo', slug: 'saopaulo', state: '', country: 'Brazil' },
  { city: 'Rio de Janeiro', slug: 'riodejaneiro', state: '', country: 'Brazil' },
  { city: 'Panama City', slug: 'panamacity', state: '', country: 'Panama' },
  { city: 'Bogota', slug: 'bogota', state: '', country: 'Colombia' },
  { city: 'Lima', slug: 'lima', state: '', country: 'Peru' },
  { city: 'Santiago', slug: 'santiago', state: '', country: 'Chile' },
  { city: 'Montevideo', slug: 'montevideo', state: '', country: 'Uruguay' },
  // Caribbean
  { city: 'Nassau', slug: 'nassau', state: '', country: 'Bahamas' },
  { city: 'Cayman Islands', slug: 'caymanislands', state: '', country: 'Cayman Islands' },
  { city: 'St Maarten', slug: 'stmaarten', state: '', country: 'St Maarten' },
  { city: 'Aruba', slug: 'aruba', state: '', country: 'Aruba' },
  { city: 'Curacao', slug: 'curacao', state: '', country: 'Curacao' },
  { city: 'Jamaica', slug: 'jamaicacarib', state: '', country: 'Jamaica' },
  { city: 'Puerto Rico', slug: 'puertorico', state: '', country: 'Puerto Rico' },
  { city: 'Virgin Islands', slug: 'virginislands', state: '', country: 'US Virgin Islands' },
  // Africa
  { city: 'Casablanca', slug: 'casablanca', state: '', country: 'Morocco' },
  { city: 'Marrakech', slug: 'marrakech', state: '', country: 'Morocco' },
  { city: 'Nairobi', slug: 'nairobi', state: '', country: 'Kenya' },
  { city: 'Lagos', slug: 'lagos', state: '', country: 'Nigeria' },
  { city: 'Accra', slug: 'accra', state: '', country: 'Ghana' },
];

// Expanded regions
const REGIONS = [
  'valley', 'beaches', 'desert', 'mountains', 'hills',
  'shore', 'coast', 'harbor', 'bay', 'lakes', 'keys',
  'hamptons', 'poconos', 'berkshires', 'catskills', 'ozarks',
  'mainline', 'northshore', 'southshore', 'eastside', 'westside',
  'downtown', 'uptown', 'midtown', 'waterfront',
  'peninsula', 'ranch', 'island', 'ridge', 'creek',
  'palisades', 'heights', 'park', 'woods', 'grove',
  'meadows', 'springs', 'falls', 'river', 'lake',
  'conejo', 'sfvalley', 'westside', 'southbay',
  'tri-valley', 'eastbay',
];

// Additional URL patterns beyond the standard 7
const EXTRA_DOMAIN_PATTERNS = [
  'jewishcenterof{slug}',
  'chabadhouse{slug}',
  'jewishlifeof{slug}',
  'chabadcenterof{slug}',
  'myjewish{slug}',
  'chabadnorth{slug}',
  'chabadsouth{slug}',
  'chabadwest{slug}',
  'chabadeast{slug}',
  'youngchabad{slug}',
  'chabadyoungprofessionals{slug}',
];

// Contact page paths to try after finding a live website
const CONTACT_PATHS = ['/contact', '/contact-us', '/about', '/about-us', '/rabbi', '/our-rabbi', '/staff'];

function generateAllUrls(): Array<{ url: string; city: CityEntry }> {
  const urls: Array<{ url: string; city: CityEntry }> = [];

  for (const city of CITIES) {
    // Standard 7 patterns
    const patterns = [
      `https://www.chabadof${city.slug}.com`,
      `https://www.chabad${city.slug}.com`,
      `https://www.chabad${city.slug}.org`,
      `https://www.chabadof${city.slug}.org`,
      `https://www.${city.slug}chabad.com`,
      `https://www.jewishof${city.slug}.com`,
      `https://www.jewish${city.slug}.com`,
    ];
    // Extra patterns
    for (const extra of EXTRA_DOMAIN_PATTERNS) {
      patterns.push(`https://www.${extra.replace('{slug}', city.slug)}.com`);
      patterns.push(`https://www.${extra.replace('{slug}', city.slug)}.org`);
    }

    for (const url of patterns) {
      urls.push({ url, city });
    }
  }

  // Region-based URLs
  for (const region of REGIONS) {
    const regionCity: CityEntry = {
      city: region.charAt(0).toUpperCase() + region.slice(1),
      slug: region,
      state: '',
      country: 'United States',
    };
    urls.push({ url: `https://www.chabadofthe${region}.com`, city: regionCity });
    urls.push({ url: `https://www.chabadofthe${region}.org`, city: regionCity });
    urls.push({ url: `https://www.chabadofthe${region}.net`, city: regionCity });
  }

  return urls;
}

export async function scrapeByEmailPattern(): Promise<ChabadCenter[]> {
  const allCenters: ChabadCenter[] = [];
  const urls = generateAllUrls();

  console.log(`\n=== Smart Email Pattern Scraper (EXPANDED) ===`);
  console.log(`Generated ${urls.length} potential Chabad website URLs to check`);
  console.log(`Cities: ${CITIES.length} | Regions: ${REGIONS.length} | Extra patterns: ${EXTRA_DOMAIN_PATTERNS.length}`);
  console.log(`Checking websites and extracting contact info...\n`);

  let found = 0;
  let checked = 0;
  const batchSize = 8;

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async ({ url, city }) => {
        try {
          const html = await fetchPage(url);
          if (!html) return null;

          const center = extractCenterInfo(html, url, city);
          if (center && (center.email || center.phone)) {
            // Also try to scrape /contact page for more info
            await enrichFromContactPage(center, url);
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
        const name = result.value.name?.substring(0, 40) || result.value.website;
        console.log(`  [+] ${name} | ${result.value.email || '-'} | ${result.value.phone || '-'}`);
      }
    }

    if (checked % 100 === 0 || i + batchSize >= urls.length) {
      const pct = Math.round((checked / urls.length) * 100);
      console.log(`  --- Progress: ${checked}/${urls.length} (${pct}%), ${found} found ---`);
    }

    await sleep(250);
  }

  console.log(`\nEmail pattern scraper complete: ${found} centers found from ${checked} URLs checked`);
  return allCenters;
}

async function enrichFromContactPage(center: ChabadCenter, baseUrl: string): Promise<void> {
  // Only try contact pages if we're missing key data
  if (center.email && center.phone && center.rabbi) return;

  for (const path of CONTACT_PATHS) {
    try {
      const contactUrl = baseUrl.replace(/\/$/, '') + path;
      const html = await fetchPage(contactUrl);
      if (!html) continue;

      const $ = load(html);
      const bodyText = $('body').text();
      const htmlStr = $.html();

      // Fill missing email
      if (!center.email) {
        const emails = (htmlStr.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [])
          .filter(filterJunkEmail);
        if (emails.length) center.email = [...new Set(emails)].join('; ');
      }

      // Fill missing phone
      if (!center.phone) {
        const phoneTags: string[] = [];
        $('a[href^="tel:"]').each((_i, el) => {
          const t = $(el).attr('href')?.replace('tel:', '').trim();
          if (t) phoneTags.push(t);
        });
        if (phoneTags.length) center.phone = phoneTags[0];
        else center.phone = extractPhone(bodyText);
      }

      // Fill missing rabbi
      if (!center.rabbi) {
        const rabbiMatch = bodyText.match(
          /Rabbi\s+([A-Z][a-z]+(?:\s+(?:and\s+)?(?:[A-Z]\.?\s+)?[A-Z][a-z]+){1,3})/
        );
        if (rabbiMatch) center.rabbi = rabbiMatch[1].trim();
      }

      // Fill missing address
      if (!center.address) {
        center.address = cleanText(
          $('[itemprop="streetAddress"]').text() ||
          $('[itemprop="address"]').text() ||
          $('.address').text()
        );
      }

      // If we got everything, stop
      if (center.email && center.phone && center.rabbi) break;
    } catch {
      // continue to next contact path
    }
  }
}

function filterJunkEmail(e: string): boolean {
  const junk = [
    'example.com', 'sentry', 'wixpress', 'wordpress', 'google.com',
    'w3.org', 'schema.org', 'cloudflare', 'jsdelivr', 'noreply',
    'donotreply', '.png', '.jpg', '.gif', '.svg', 'gravatar',
    'squarespace', 'mailchimp', 'constantcontact', 'hubspot',
  ];
  return e.length < 60 && !junk.some(j => e.toLowerCase().includes(j));
}

function extractCenterInfo(html: string, url: string, city: CityEntry): ChabadCenter | null {
  const $ = load(html);

  let name = cleanText($('title').text()) ||
    cleanText($('h1').first().text()) ||
    cleanText($('meta[property="og:site_name"]').attr('content') || '');
  name = name
    .replace(/\s*[-|–—]\s*(Home|Welcome|Main|Page).*$/i, '')
    .replace(/^\s*(Home|Welcome)\s*[-|–—]\s*/i, '');

  const htmlStr = $.html();
  const emailMatches = htmlStr.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [];
  const filteredEmails = [...new Set(emailMatches)].filter(filterJunkEmail);
  const email = filteredEmails.join('; ');

  const phoneFromLinks: string[] = [];
  $('a[href^="tel:"]').each((_i, el) => {
    const tel = $(el).attr('href')?.replace('tel:', '').trim();
    if (tel) phoneFromLinks.push(tel);
  });
  const phone = phoneFromLinks[0] || extractPhone($('body').text());

  let rabbi = '';
  const bodyText = $('body').text();
  const rabbiPatterns = [
    /Rabbi\s+([A-Z][a-z]+(?:\s+(?:and\s+)?(?:[A-Z]\.?\s+)?[A-Z][a-z]+){1,3})/,
    /(?:Director|Shliach|Emissary)[:\s]+(?:Rabbi\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
  ];
  for (const pattern of rabbiPatterns) {
    const match = bodyText.match(pattern);
    if (match) { rabbi = match[1].trim(); break; }
  }

  let rebbetzin = '';
  const rebbetzinMatch = bodyText.match(
    /(?:Rebbetzin|Mrs\.?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/
  );
  if (rebbetzinMatch) rebbetzin = rebbetzinMatch[1].trim();

  const address = cleanText(
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
