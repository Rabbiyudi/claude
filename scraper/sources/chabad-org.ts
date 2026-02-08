import { load, type CheerioAPI } from 'cheerio';
import { ChabadCenter, CountryConfig } from '../types';
import { CHABAD_ORG_BASE, REQUEST_DELAY_MS } from '../config';
import { fetchPage, cleanText, extractEmail, extractPhone, sleep, formatTimestamp, progressBar } from '../utils';

/**
 * Scrape Chabad centers from chabad.org directory pages.
 * The directory at chabad.org/jewish-centers/ lists centers by country and region.
 */

export async function scrapeChabadOrg(countries: CountryConfig[]): Promise<ChabadCenter[]> {
  const allCenters: ChabadCenter[] = [];

  console.log('\n=== Scraping chabad.org directory ===');

  for (let i = 0; i < countries.length; i++) {
    const country = countries[i];
    console.log(`\n[${i + 1}/${countries.length}] Scraping ${country.name}...`);

    try {
      const centers = await scrapeCountry(country);
      allCenters.push(...centers);
      console.log(`  Found ${centers.length} centers in ${country.name}`);
    } catch (err) {
      console.error(`  Error scraping ${country.name}:`, (err as Error).message);
    }

    if (i < countries.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  return allCenters;
}

async function scrapeCountry(country: CountryConfig): Promise<ChabadCenter[]> {
  const url = `${CHABAD_ORG_BASE}${country.chabadOrgPath}`;
  const html = await fetchPage(url);
  if (!html) return [];

  const centers: ChabadCenter[] = [];
  const $ = load(html);

  // Try to extract center listing links from the country page
  const regionLinks: string[] = [];

  // Look for links to region/state pages
  $('a[href*="/jewish-centers/"]').each((_i, el) => {
    const href = $(el).attr('href');
    if (href && !href.includes('/country/') && href !== country.chabadOrgPath) {
      const fullUrl = href.startsWith('http') ? href : `${CHABAD_ORG_BASE}${href}`;
      if (!regionLinks.includes(fullUrl)) {
        regionLinks.push(fullUrl);
      }
    }
  });

  // Also try to parse centers directly from the country page
  const pageCenters = parseCenterListings($, country, url);
  centers.push(...pageCenters);

  // Follow region links to get more centers
  if (regionLinks.length > 0) {
    console.log(`  Found ${regionLinks.length} region pages for ${country.name}`);
    for (let i = 0; i < regionLinks.length; i++) {
      progressBar(i + 1, regionLinks.length, `Regions in ${country.name}`);
      try {
        await sleep(REQUEST_DELAY_MS);
        const regionHtml = await fetchPage(regionLinks[i]);
        if (regionHtml) {
          const region$ = load(regionHtml);
          const regionCenters = parseCenterListings(region$, country, regionLinks[i]);
          centers.push(...regionCenters);

          // Look for individual center detail pages
          const detailLinks: string[] = [];
          region$('a[href*="/jewish-centers/"]').each((_j, el) => {
            const href = region$(el).attr('href');
            if (href && !detailLinks.includes(href) && href.includes('/location/')) {
              const fullUrl = href.startsWith('http') ? href : `${CHABAD_ORG_BASE}${href}`;
              detailLinks.push(fullUrl);
            }
          });

          // Scrape individual center pages
          for (const detailUrl of detailLinks.slice(0, 50)) {
            await sleep(REQUEST_DELAY_MS);
            const detail = await scrapeCenterDetail(detailUrl, country);
            if (detail) centers.push(detail);
          }
        }
      } catch (err) {
        console.error(`\n  Error on region page:`, (err as Error).message);
      }
    }
  }

  return deduplicateCenters(centers);
}

function parseCenterListings(
  $: CheerioAPI,
  country: CountryConfig,
  sourceUrl: string
): ChabadCenter[] {
  const centers: ChabadCenter[] = [];

  // Try multiple possible selectors for center cards/listings
  const selectors = [
    '.center-card', '.center-item', '.listing-item',
    '[data-center]', '.result-item', '.directory-item',
    '.center', 'article', '.card',
  ];

  for (const selector of selectors) {
    $(selector).each((_i, el) => {
      const $el = $(el);
      const center = extractCenterFromElement($, $el, country, sourceUrl);
      if (center && (center.name || center.rabbi)) {
        centers.push(center);
      }
    });
    if (centers.length > 0) break;
  }

  // Fallback: Try to parse any structured data from the page
  if (centers.length === 0) {
    // Look for JSON-LD structured data
    $('script[type="application/ld+json"]').each((_i, el) => {
      try {
        const json = JSON.parse($(el).html() || '');
        const items = Array.isArray(json) ? json : [json];
        for (const item of items) {
          if (item['@type'] === 'Organization' || item['@type'] === 'Synagogue' ||
              item['@type'] === 'Place' || item['@type'] === 'LocalBusiness') {
            centers.push({
              name: item.name || '',
              rabbi: '',
              rebbetzin: '',
              address: typeof item.address === 'string'
                ? item.address
                : (item.address?.streetAddress || ''),
              city: item.address?.addressLocality || '',
              state: item.address?.addressRegion || '',
              country: country.name,
              zipCode: item.address?.postalCode || '',
              phone: item.telephone || '',
              email: item.email || '',
              website: item.url || '',
              source: 'chabad.org',
              sourceUrl,
              scrapedAt: formatTimestamp(),
            });
          }
        }
      } catch { /* ignore parse errors */ }
    });
  }

  // Fallback: try to extract from general page text
  if (centers.length === 0) {
    const text = $.html();
    const emailMatches = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [];
    const uniqueEmails = [...new Set(emailMatches)]
      .filter(e => !e.includes('chabad.org') && !e.includes('example.com'));

    for (const email of uniqueEmails) {
      centers.push({
        name: '',
        rabbi: '',
        rebbetzin: '',
        address: '',
        city: '',
        state: '',
        country: country.name,
        zipCode: '',
        phone: '',
        email,
        website: '',
        source: 'chabad.org',
        sourceUrl,
        scrapedAt: formatTimestamp(),
      });
    }
  }

  return centers;
}

function extractCenterFromElement(
  $: CheerioAPI,
  $el: ReturnType<CheerioAPI>,
  country: CountryConfig,
  sourceUrl: string
): ChabadCenter | null {
  const text = $el.text();
  const html = $.html($el);

  // Extract name (usually the heading or link)
  const name = cleanText(
    $el.find('h2, h3, h4, .center-name, .title, a').first().text()
  );

  // Extract rabbi name
  let rabbi = '';
  const rabbiMatch = text.match(/(?:Rabbi|Rav|Director|Shliach)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i);
  if (rabbiMatch) rabbi = rabbiMatch[1].trim();

  // Extract rebbetzin name
  let rebbetzin = '';
  const rebbetzinMatch = text.match(/(?:Rebbetzin|Mrs\.?)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i);
  if (rebbetzinMatch) rebbetzin = rebbetzinMatch[1].trim();

  // Extract address
  const address = cleanText(
    $el.find('.address, .location, [itemprop="address"], .street-address').text()
  );

  // Extract phone
  const phone = extractPhone(text) ||
    cleanText($el.find('.phone, [itemprop="telephone"], a[href^="tel:"]').text());

  // Extract email
  const email = extractEmail(html) ||
    cleanText($el.find('[itemprop="email"], a[href^="mailto:"]').text());

  // Extract website
  const website = $el.find('a[href^="http"]').not('[href*="chabad.org"]').attr('href') || '';

  return {
    name,
    rabbi,
    rebbetzin,
    address,
    city: '',
    state: '',
    country: country.name,
    zipCode: '',
    phone,
    email,
    website,
    source: 'chabad.org',
    sourceUrl,
    scrapedAt: formatTimestamp(),
  };
}

async function scrapeCenterDetail(url: string, country: CountryConfig): Promise<ChabadCenter | null> {
  const html = await fetchPage(url);
  if (!html) return null;

  const $ = load(html);

  const name = cleanText($('h1, .center-name, .page-title').first().text());
  if (!name) return null;

  let rabbi = '';
  const rabbiEl = $('.director, .rabbi, .shliach, [itemprop="employee"]');
  if (rabbiEl.length) {
    rabbi = cleanText(rabbiEl.text());
  } else {
    const text = $('body').text();
    const rabbiMatch = text.match(/(?:Rabbi|Director|Shliach)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i);
    if (rabbiMatch) rabbi = rabbiMatch[1].trim();
  }

  const address = cleanText(
    $('[itemprop="streetAddress"], .street-address, .address').text()
  );
  const city = cleanText($('[itemprop="addressLocality"], .city').text());
  const state = cleanText($('[itemprop="addressRegion"], .state').text());
  const zipCode = cleanText($('[itemprop="postalCode"], .zip').text());
  const phone = cleanText($('[itemprop="telephone"], .phone, a[href^="tel:"]').first().text())
    || extractPhone($('body').text());
  const email = extractEmail($.html())
    || cleanText($('[itemprop="email"], a[href^="mailto:"]').first().text());
  const website = $('a[href^="http"]')
    .not('[href*="chabad.org"]')
    .not('[href*="google"]')
    .not('[href*="facebook"]')
    .first()
    .attr('href') || '';

  return {
    name,
    rabbi,
    rebbetzin: '',
    address,
    city,
    state,
    country: country.name,
    zipCode,
    phone,
    email,
    website,
    source: 'chabad.org',
    sourceUrl: url,
    scrapedAt: formatTimestamp(),
  };
}

function deduplicateCenters(centers: ChabadCenter[]): ChabadCenter[] {
  const seen = new Set<string>();
  return centers.filter(c => {
    const key = `${c.name}|${c.email}|${c.phone}`.toLowerCase();
    if (key === '||') return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
