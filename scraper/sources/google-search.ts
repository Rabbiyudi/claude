import { load } from 'cheerio';
import { ChabadCenter } from '../types';
import { REQUEST_DELAY_MS } from '../config';
import { fetchPage, cleanText, extractEmail, extractPhone, sleep, formatTimestamp, progressBar } from '../utils';

/**
 * Scrape Chabad center contact info by searching individual Chabad house websites.
 * Uses known URL patterns for Chabad house websites.
 */

// Common patterns for Chabad house website URLs
const CHABAD_SITE_PATTERNS = [
  'chabadhouse', 'jewishcenter', 'chabadofthe', 'chabadof',
  'jewishlife', 'myjewish', 'chabadcenter',
];

// Known Chabad house website domain patterns
function generateChabadWebsiteUrls(): string[] {
  const urls: string[] = [];

  // Generate URLs for US cities (major cities by state)
  const majorCities: Record<string, string[]> = {
    'New York': ['manhattan', 'brooklyn', 'queens', 'bronx', 'statenisland', 'uppereastside', 'upperwestside', 'midtown', 'tribeca', 'soho', 'greenwich-village'],
    'California': ['losangeles', 'sanfrancisco', 'sandiego', 'sanjose', 'sacramento', 'paloalto', 'beverlyhills', 'santamonica', 'pasadena', 'irvine', 'berkeley'],
    'Florida': ['miami', 'fortlauderdale', 'bocaraton', 'palmbeach', 'orlando', 'tampa', 'jacksonville', 'naples', 'sarasota', 'hollywood'],
    'Texas': ['houston', 'dallas', 'austin', 'sanantonio', 'plano', 'frisco', 'sugarland'],
    'Illinois': ['chicago', 'evanston', 'skokie', 'lincolnpark', 'lakeview', 'highlandpark'],
    'New Jersey': ['hoboken', 'jerseycity', 'teaneck', 'livingston', 'maplewood', 'morristown', 'princeton'],
    'Massachusetts': ['boston', 'cambridge', 'brookline', 'newton', 'wellesley'],
    'Pennsylvania': ['philadelphia', 'pittsburgh', 'mainline', 'lowerbucks'],
    'Maryland': ['baltimore', 'bethesda', 'rockville', 'silver-spring'],
    'Connecticut': ['westport', 'stamford', 'newhaven', 'greenwich', 'fairfield'],
    'Georgia': ['atlanta', 'savannah', 'alpharetta'],
    'Arizona': ['scottsdale', 'phoenix', 'tucson', 'chandler'],
    'Colorado': ['denver', 'boulder', 'aspen', 'vail'],
    'Nevada': ['lasvegas', 'henderson', 'reno'],
    'Washington': ['seattle', 'bellevue', 'mercerisland'],
    'Oregon': ['portland', 'eugene'],
    'Michigan': ['annarbor', 'detroit', 'westbloomfield'],
    'Ohio': ['cleveland', 'columbus', 'cincinnati'],
    'Minnesota': ['minneapolis', 'stpaul'],
    'Missouri': ['stlouis', 'kansascity'],
    'Virginia': ['richmond', 'fairfax', 'charlottesville', 'arlington'],
    'North Carolina': ['charlotte', 'raleigh', 'durham', 'chapelhill'],
  };

  for (const [_state, cities] of Object.entries(majorCities)) {
    for (const city of cities) {
      urls.push(`https://www.chabadof${city}.com`);
      urls.push(`https://www.chabad${city}.com`);
      urls.push(`https://www.chabad${city}.org`);
    }
  }

  // UK cities
  const ukCities = ['london', 'manchester', 'leeds', 'birmingham', 'edinburgh', 'glasgow', 'oxford', 'cambridge', 'brighton', 'liverpool', 'bristol', 'nottingham'];
  for (const city of ukCities) {
    urls.push(`https://www.chabad${city}.com`);
    urls.push(`https://www.chabadof${city}.com`);
  }

  // Australia cities
  const auCities = ['sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'goldcoast', 'canberra'];
  for (const city of auCities) {
    urls.push(`https://www.chabad${city}.com`);
    urls.push(`https://www.chabadof${city}.com`);
  }

  // Canada cities
  const caCities = ['toronto', 'montreal', 'vancouver', 'ottawa', 'calgary', 'edmonton', 'winnipeg', 'halifax'];
  for (const city of caCities) {
    urls.push(`https://www.chabad${city}.com`);
    urls.push(`https://www.chabadof${city}.com`);
  }

  // South Africa
  const zaCities = ['capetown', 'johannesburg', 'durban', 'pretoria'];
  for (const city of zaCities) {
    urls.push(`https://www.chabad${city}.com`);
    urls.push(`https://www.chabadof${city}.com`);
  }

  return urls;
}

export async function scrapeDirectWebsites(): Promise<ChabadCenter[]> {
  const allCenters: ChabadCenter[] = [];
  const urls = generateChabadWebsiteUrls();

  console.log(`\n=== Scraping ${urls.length} potential Chabad websites directly ===`);

  for (let i = 0; i < urls.length; i++) {
    progressBar(i + 1, urls.length, urls[i].replace('https://www.', ''));

    try {
      const html = await fetchPage(urls[i]);
      if (!html) continue;

      const center = extractFromWebsite(html, urls[i]);
      if (center && (center.email || center.phone)) {
        allCenters.push(center);
      }
    } catch {
      // continue to next
    }

    // Short delay between requests
    await sleep(500);
  }

  console.log(`\n  Found ${allCenters.length} centers from direct website scraping`);
  return allCenters;
}

function extractFromWebsite(html: string, url: string): ChabadCenter | null {
  const $ = load(html);

  // Get the page title as the center name
  let name = cleanText($('title').text()) || cleanText($('h1').first().text());
  // Clean up common suffixes
  name = name.replace(/\s*[-|–]\s*Home$/i, '').replace(/\s*[-|–]\s*Welcome$/i, '');

  // Extract emails from the page
  const emails = ($.html().match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [])
    .filter(e => !e.includes('example.com') && !e.includes('sentry') && !e.includes('wixpress'));
  const email = [...new Set(emails)].join('; ');

  // Extract phone numbers
  const phoneLinks = $('a[href^="tel:"]')
    .map((_i, el) => $(el).attr('href')?.replace('tel:', '').trim())
    .get();
  const phone = phoneLinks[0] || extractPhone($('body').text());

  // Extract rabbi name
  let rabbi = '';
  const text = $('body').text();
  const rabbiMatch = text.match(/(?:Rabbi|Rav)\s+([A-Z][a-z]+(?:\s+(?:and\s+)?[A-Z][a-z]+){1,3})/);
  if (rabbiMatch) rabbi = rabbiMatch[1].trim();

  // Extract address
  let address = '';
  const addressEl = $('[itemprop="streetAddress"], .address, .location-address');
  if (addressEl.length) {
    address = cleanText(addressEl.text());
  }

  // Extract city/state from meta or structured data
  const city = cleanText($('[itemprop="addressLocality"]').text());
  const state = cleanText($('[itemprop="addressRegion"]').text());
  const zipCode = cleanText($('[itemprop="postalCode"]').text());

  // Determine country from URL
  let country = 'Unknown';
  if (url.includes('.com') || url.includes('.org')) {
    // Default to US for .com/.org, but could be any country
    country = 'United States';
  }

  return {
    name,
    rabbi,
    rebbetzin: '',
    address,
    city,
    state,
    country,
    zipCode,
    phone,
    email,
    website: url,
    source: 'direct-website',
    sourceUrl: url,
    scrapedAt: formatTimestamp(),
  };
}
