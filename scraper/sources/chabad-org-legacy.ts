import { load, type CheerioAPI } from 'cheerio';
import { ChabadCenter, CountryConfig } from '../types';
import { CHABAD_ORG_BASE, REQUEST_DELAY_MS } from '../config';
import { fetchPage, cleanText, extractEmail, extractPhone, sleep, formatTimestamp } from '../utils';

/**
 * Scrape from the legacy chabad.org directory format.
 * Uses the older URL pattern: /centers/default_cdo/...
 */

const LEGACY_URLS: Record<string, string[]> = {
  USA: [
    '/centers/default_cdo/jewish/Chabad-Centers-in-United-States.htm',
    '/centers/default_cdo/qry/20812/jewish/Chabad-Centers-and-Synagogue-Directory.htm',
  ],
  CA: [
    '/centers/default_cdo/jewish/Chabad-Centers-in-Canada.htm',
  ],
  GB: [
    '/centers/default_cdo/jewish/Chabad-Centers-in-United-Kingdom.htm',
  ],
  AU: [
    '/centers/default_cdo/jewish/Chabad-Centers-in-Australia.htm',
  ],
  IL: [
    '/centers/default_cdo/jewish/Chabad-Centers-in-Israel.htm',
  ],
  ZA: [
    '/centers/default_cdo/jewish/Chabad-Centers-in-South-Africa.htm',
  ],
};

export async function scrapeChabadOrgLegacy(countries: CountryConfig[]): Promise<ChabadCenter[]> {
  const allCenters: ChabadCenter[] = [];

  console.log('\n=== Scraping chabad.org legacy directory ===');

  for (const country of countries) {
    const urls = LEGACY_URLS[country.code] || [];
    if (urls.length === 0) continue;

    console.log(`\nScraping legacy pages for ${country.name}...`);

    for (const path of urls) {
      const url = `${CHABAD_ORG_BASE}${path}`;
      try {
        const html = await fetchPage(url);
        if (!html) continue;

        const $ = load(html);
        const centers = parseLegacyPage($, country, url);
        allCenters.push(...centers);
        console.log(`  Found ${centers.length} centers from ${path}`);

        // Find links to state/region pages and follow them
        const stateLinks: string[] = [];
        $('a[href*="centers/default_cdo"]').each((_i, el) => {
          const href = $(el).attr('href');
          if (href && !stateLinks.includes(href) && href !== path) {
            stateLinks.push(href.startsWith('http') ? href : `${CHABAD_ORG_BASE}${href}`);
          }
        });

        console.log(`  Found ${stateLinks.length} sub-pages`);

        for (const stateUrl of stateLinks) {
          await sleep(REQUEST_DELAY_MS);
          try {
            const stateHtml = await fetchPage(stateUrl);
            if (stateHtml) {
              const state$ = load(stateHtml);
              const stateCenters = parseLegacyPage(state$, country, stateUrl);
              allCenters.push(...stateCenters);
            }
          } catch {
            // continue
          }
        }
      } catch (err) {
        console.error(`  Error:`, (err as Error).message);
      }

      await sleep(REQUEST_DELAY_MS);
    }
  }

  return allCenters;
}

function parseLegacyPage(
  $: CheerioAPI,
  country: CountryConfig,
  sourceUrl: string
): ChabadCenter[] {
  const centers: ChabadCenter[] = [];

  // Legacy pages typically have tables or divs with center info
  $('table tr, .center-listing, .directory-entry, li').each((_i, el) => {
    const $el = $(el);
    const text = $el.text();

    // Skip headers and navigation elements
    if (text.length < 20 || text.length > 2000) return;

    // Must contain at least something that looks like a Chabad center
    if (!text.match(/chabad|synagogue|jewish|rabbi|shul/i)) return;

    const email = extractEmail($.html($el));
    const phone = extractPhone(text);
    const name = cleanText($el.find('a, b, strong, h3, h4').first().text());

    if (!name && !email && !phone) return;

    let rabbi = '';
    const rabbiMatch = text.match(/(?:Rabbi|Rav)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i);
    if (rabbiMatch) rabbi = rabbiMatch[1].trim();

    const address = cleanText(
      $el.find('.address, td:nth-child(2)').text()
    );

    const website = $el.find('a[href^="http"]')
      .not('[href*="chabad.org"]')
      .first()
      .attr('href') || '';

    centers.push({
      name: name || '',
      rabbi,
      rebbetzin: '',
      address,
      city: '',
      state: '',
      country: country.name,
      zipCode: '',
      phone,
      email,
      website,
      source: 'chabad.org-legacy',
      sourceUrl,
      scrapedAt: formatTimestamp(),
    });
  });

  return centers;
}
