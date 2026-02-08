import { load, type CheerioAPI } from 'cheerio';
import { ChabadCenter, CountryConfig } from '../types';
import { REQUEST_DELAY_MS } from '../config';
import { fetchPage, cleanText, extractEmail, extractPhone, sleep, formatTimestamp } from '../utils';

/**
 * Scrape from lubavitch.com - the Chabad Lubavitch World Headquarters site.
 */

const LUBAVITCH_BASE = 'https://www.lubavitch.com';

export async function scrapeLubavitchCom(countries: CountryConfig[]): Promise<ChabadCenter[]> {
  const allCenters: ChabadCenter[] = [];

  console.log('\n=== Scraping lubavitch.com ===');

  // Try the main centers page
  const mainUrl = `${LUBAVITCH_BASE}/centers`;
  const html = await fetchPage(mainUrl);

  if (html) {
    const $ = load(html);
    const centers = parseLubavitchPage($, mainUrl);
    allCenters.push(...centers);
    console.log(`  Found ${centers.length} centers from main page`);

    // Look for regional links
    const regionLinks: string[] = [];
    $('a[href*="/centers"]').each((_i, el) => {
      const href = $(el).attr('href');
      if (href && href !== '/centers' && href !== mainUrl) {
        const fullUrl = href.startsWith('http') ? href : `${LUBAVITCH_BASE}${href}`;
        if (!regionLinks.includes(fullUrl)) {
          regionLinks.push(fullUrl);
        }
      }
    });

    for (const regionUrl of regionLinks) {
      await sleep(REQUEST_DELAY_MS);
      try {
        const regionHtml = await fetchPage(regionUrl);
        if (regionHtml) {
          const region$ = load(regionHtml);
          const regionCenters = parseLubavitchPage(region$, regionUrl);
          allCenters.push(...regionCenters);
        }
      } catch {
        // continue
      }
    }
  }

  // Try the directory page
  const dirUrl = `${LUBAVITCH_BASE}/directory`;
  const dirHtml = await fetchPage(dirUrl);
  if (dirHtml) {
    const $ = load(dirHtml);
    const centers = parseLubavitchPage($, dirUrl);
    allCenters.push(...centers);
    console.log(`  Found ${centers.length} centers from directory page`);
  }

  return allCenters;
}

function parseLubavitchPage(
  $: CheerioAPI,
  sourceUrl: string
): ChabadCenter[] {
  const centers: ChabadCenter[] = [];

  // Try various selectors
  const selectors = [
    '.center-card', '.center-listing', '.directory-item',
    'article', '.card', '.listing', '.result',
    'tr', 'li',
  ];

  for (const selector of selectors) {
    $(selector).each((_i, el) => {
      const $el = $(el);
      const text = $el.text();

      if (text.length < 15 || text.length > 3000) return;
      if (!text.match(/chabad|rabbi|synagogue|jewish|center|house/i)) return;

      const name = cleanText($el.find('h2, h3, h4, a, .title, .name, strong').first().text());
      const email = extractEmail($.html($el));
      const phone = extractPhone(text);

      if (!name && !email && !phone) return;

      let rabbi = '';
      const rabbiMatch = text.match(/(?:Rabbi|Rav)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i);
      if (rabbiMatch) rabbi = rabbiMatch[1].trim();

      const address = cleanText($el.find('.address, .location').text());
      const website = $el.find('a[href^="http"]')
        .not('[href*="lubavitch.com"]')
        .first()
        .attr('href') || '';

      centers.push({
        name,
        rabbi,
        rebbetzin: '',
        address,
        city: '',
        state: '',
        country: '',
        zipCode: '',
        phone,
        email,
        website,
        source: 'lubavitch.com',
        sourceUrl,
        scrapedAt: formatTimestamp(),
      });
    });
  }

  // Fallback: extract emails from the whole page
  if (centers.length === 0) {
    const allEmails = ($.html().match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [])
      .filter(e =>
        !e.includes('lubavitch.com') &&
        !e.includes('example.com') &&
        !e.includes('wordpress') &&
        !e.includes('sentry')
      );

    for (const email of [...new Set(allEmails)]) {
      centers.push({
        name: '',
        rabbi: '',
        rebbetzin: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        phone: '',
        email,
        website: '',
        source: 'lubavitch.com',
        sourceUrl,
        scrapedAt: formatTimestamp(),
      });
    }
  }

  return centers;
}
