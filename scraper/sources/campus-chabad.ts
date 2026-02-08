import { load, type CheerioAPI } from 'cheerio';
import { ChabadCenter } from '../types';
import { CHABAD_ORG_BASE, REQUEST_DELAY_MS } from '../config';
import { fetchPage, cleanText, extractEmail, extractPhone, sleep, formatTimestamp } from '../utils';

/**
 * Scrape Chabad on Campus directory.
 */

export async function scrapeCampusChabad(): Promise<ChabadCenter[]> {
  const allCenters: ChabadCenter[] = [];

  console.log('\n=== Scraping Chabad on Campus directory ===');

  const urls = [
    `${CHABAD_ORG_BASE}/centers/campus_cdo/jewish/Campus-Directory.htm`,
    `${CHABAD_ORG_BASE}/centers/campus_cdo/aid/164198/jewish/Campus-Directory.htm`,
  ];

  for (const url of urls) {
    const html = await fetchPage(url);
    if (!html) continue;

    const $ = load(html);

    // Find campus listing links
    const campusLinks: string[] = [];
    $('a[href*="campus"]').each((_i, el) => {
      const href = $(el).attr('href');
      if (href && !campusLinks.includes(href)) {
        campusLinks.push(href.startsWith('http') ? href : `${CHABAD_ORG_BASE}${href}`);
      }
    });

    // Parse centers from the page itself
    const centers = parseCampusListings($, url);
    allCenters.push(...centers);

    // Follow campus links
    for (const campusUrl of campusLinks.slice(0, 100)) {
      await sleep(REQUEST_DELAY_MS);
      try {
        const campusHtml = await fetchPage(campusUrl);
        if (campusHtml) {
          const campus$ = load(campusHtml);
          const campusCenters = parseCampusListings(campus$, campusUrl);
          allCenters.push(...campusCenters);
        }
      } catch {
        // continue
      }
    }

    console.log(`  Found ${allCenters.length} campus Chabad centers so far`);
    await sleep(REQUEST_DELAY_MS);
  }

  return allCenters;
}

function parseCampusListings(
  $: CheerioAPI,
  sourceUrl: string
): ChabadCenter[] {
  const centers: ChabadCenter[] = [];

  // Look for structured data first
  $('script[type="application/ld+json"]').each((_i, el) => {
    try {
      const json = JSON.parse($(el).html() || '');
      const items = Array.isArray(json) ? json : [json];
      for (const item of items) {
        if (item.name) {
          centers.push({
            name: item.name,
            rabbi: '',
            rebbetzin: '',
            address: typeof item.address === 'string' ? item.address : (item.address?.streetAddress || ''),
            city: item.address?.addressLocality || '',
            state: item.address?.addressRegion || '',
            country: item.address?.addressCountry || 'United States',
            zipCode: item.address?.postalCode || '',
            phone: item.telephone || '',
            email: item.email || '',
            website: item.url || '',
            source: 'chabad-campus',
            sourceUrl,
            scrapedAt: formatTimestamp(),
          });
        }
      }
    } catch { /* ignore */ }
  });

  // Parse from HTML
  const selectors = ['.listing', '.campus-item', '.center-card', 'article', '.card', 'tr', 'li'];
  for (const selector of selectors) {
    $(selector).each((_i, el) => {
      const $el = $(el);
      const text = $el.text();
      if (text.length < 15 || text.length > 3000) return;
      if (!text.match(/chabad|campus|university|college|rabbi|jewish/i)) return;

      const name = cleanText($el.find('h2, h3, h4, a, .title, strong').first().text());
      const email = extractEmail($.html($el));
      const phone = extractPhone(text);

      if (!name && !email && !phone) return;

      let rabbi = '';
      const rabbiMatch = text.match(/(?:Rabbi|Rav)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i);
      if (rabbiMatch) rabbi = rabbiMatch[1].trim();

      centers.push({
        name,
        rabbi,
        rebbetzin: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        phone,
        email,
        website: $el.find('a[href^="http"]').not('[href*="chabad.org"]').first().attr('href') || '',
        source: 'chabad-campus',
        sourceUrl,
        scrapedAt: formatTimestamp(),
      });
    });

    if (centers.length > 0) break;
  }

  return centers;
}
