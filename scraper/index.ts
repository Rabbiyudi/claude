import * as fs from 'fs';
import * as path from 'path';
import { ChabadCenter } from './types';
import { ENGLISH_SPEAKING_COUNTRIES, ALL_COUNTRIES } from './config';
import { scrapeByEmailPattern } from './sources/email-pattern';
import { scrapeChabadOrg } from './sources/chabad-org';
import { scrapeChabadOrgLegacy } from './sources/chabad-org-legacy';
import { scrapeLubavitchCom } from './sources/lubavitch-com';
import { scrapeCampusChabad } from './sources/campus-chabad';
import { exportToJSON, exportToCSV, ensureOutputDir, generateSummary } from './export';
import { sendResultsEmail } from './mailer';

async function main() {
  const args = process.argv.slice(2);
  const mode = args.includes('--all') ? 'all' : 'english';
  const emailOnly = args.includes('--email-pattern');
  const skipEmailPattern = args.includes('--skip-email-pattern');
  const sendTo = args.find(a => a.startsWith('--send-to='))?.split('=')[1] || process.env.SEND_TO;

  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║           CHABAD CENTER SCRAPER BOT                 ║');
  console.log('║   Collecting publicly available contact info        ║');
  console.log('║   Focus: English-speaking countries                 ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Mode: ${mode === 'all' ? 'All countries' : 'English-speaking countries (priority)'}`);
  console.log(`Strategy: ${emailOnly ? 'Email pattern only' : 'Multi-source'}`);
  if (sendTo) console.log(`Results will be emailed to: ${sendTo}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('');

  const countries = mode === 'all' ? ALL_COUNTRIES : ENGLISH_SPEAKING_COUNTRIES;
  const allCenters: ChabadCenter[] = [];
  const startTime = Date.now();

  // PRIMARY STRATEGY: Smart email pattern discovery
  // This is the most effective approach - generates known Chabad website
  // URLs (chabadof{city}.com, etc.), checks if they exist, and extracts
  // all contact info from live websites.
  if (!skipEmailPattern) {
    try {
      const patternCenters = await scrapeByEmailPattern();
      allCenters.push(...patternCenters);
      console.log(`\n>> Email pattern discovery: ${patternCenters.length} centers found`);
    } catch (err) {
      console.error('Error with email pattern scraper:', (err as Error).message);
    }
  }

  // SECONDARY STRATEGIES: Directory scraping (if not email-only mode)
  if (!emailOnly) {
    // Source 2: chabad.org directory
    try {
      const chabadOrgCenters = await scrapeChabadOrg(countries);
      allCenters.push(...chabadOrgCenters);
      console.log(`\n>> chabad.org directory: ${chabadOrgCenters.length} centers`);
    } catch (err) {
      console.error('Error with chabad.org scraper:', (err as Error).message);
    }

    // Source 3: chabad.org legacy directory
    try {
      const legacyCenters = await scrapeChabadOrgLegacy(countries);
      allCenters.push(...legacyCenters);
      console.log(`\n>> chabad.org legacy: ${legacyCenters.length} centers`);
    } catch (err) {
      console.error('Error with legacy scraper:', (err as Error).message);
    }

    // Source 4: lubavitch.com
    try {
      const lubavitchCenters = await scrapeLubavitchCom(countries);
      allCenters.push(...lubavitchCenters);
      console.log(`\n>> lubavitch.com: ${lubavitchCenters.length} centers`);
    } catch (err) {
      console.error('Error with lubavitch.com scraper:', (err as Error).message);
    }

    // Source 5: Chabad on Campus
    try {
      const campusCenters = await scrapeCampusChabad();
      allCenters.push(...campusCenters);
      console.log(`\n>> Chabad on Campus: ${campusCenters.length} centers`);
    } catch (err) {
      console.error('Error with campus scraper:', (err as Error).message);
    }
  }

  // Deduplicate across all sources
  const deduplicated = deduplicateAll(allCenters);

  const duration = Math.round((Date.now() - startTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  console.log(`\n${'='.repeat(55)}`);
  console.log(`  Scraping completed in ${minutes}m ${seconds}s`);
  console.log(`  Total raw results: ${allCenters.length}`);
  console.log(`  After deduplication: ${deduplicated.length}`);
  console.log(`${'='.repeat(55)}`);

  // Export results
  const outputDir = path.join(process.cwd(), 'scraper', 'output');
  ensureOutputDir(outputDir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const jsonPath = path.join(outputDir, `chabad-centers-${timestamp}.json`);
  const csvPath = path.join(outputDir, `chabad-centers-${timestamp}.csv`);
  const latestJsonPath = path.join(outputDir, 'chabad-centers-latest.json');
  const latestCsvPath = path.join(outputDir, 'chabad-centers-latest.csv');

  console.log('\nExporting results...');
  exportToJSON(deduplicated, jsonPath);
  exportToCSV(deduplicated, csvPath);
  exportToJSON(deduplicated, latestJsonPath);
  exportToCSV(deduplicated, latestCsvPath);

  // Generate and save summary
  const summary = generateSummary(deduplicated);
  console.log(`\n${summary}`);

  const summaryPath = path.join(outputDir, `summary-${timestamp}.txt`);
  fs.writeFileSync(summaryPath, summary, 'utf-8');

  // Send results via email if configured
  if (sendTo) {
    try {
      await sendResultsEmail(
        { to: sendTo },
        latestCsvPath,
        latestJsonPath,
        summary,
        deduplicated.length
      );
    } catch {
      console.log('\n  Email sending failed. Results saved locally.');
      console.log(`  CSV: ${latestCsvPath}`);
      console.log(`  JSON: ${latestJsonPath}`);
    }
  } else {
    console.log('\n  No email configured. To send results by email, use:');
    console.log('    npm run scrape -- --send-to=your@email.com');
    console.log('  And set SMTP env vars: SMTP_HOST, SMTP_USER, SMTP_PASS');
  }

  console.log('\nDone!');
}

function deduplicateAll(centers: ChabadCenter[]): ChabadCenter[] {
  const seen = new Map<string, ChabadCenter>();

  for (const center of centers) {
    const emailKey = center.email ? center.email.toLowerCase().split(';')[0].trim() : '';
    const nameKey = center.name ? center.name.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    const locationKey = `${center.city}${center.state}${center.country}`.toLowerCase().replace(/[^a-z0-9]/g, '');

    let key = '';
    if (emailKey) {
      key = `email:${emailKey}`;
    } else if (nameKey && locationKey) {
      key = `name:${nameKey}:${locationKey}`;
    } else if (center.phone) {
      key = `phone:${center.phone.replace(/\D/g, '')}`;
    } else if (nameKey) {
      key = `name:${nameKey}`;
    } else {
      continue;
    }

    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, center);
    } else {
      seen.set(key, mergeCenter(existing, center));
    }
  }

  return [...seen.values()];
}

function mergeCenter(a: ChabadCenter, b: ChabadCenter): ChabadCenter {
  return {
    name: a.name || b.name,
    rabbi: a.rabbi || b.rabbi,
    rebbetzin: a.rebbetzin || b.rebbetzin,
    address: a.address || b.address,
    city: a.city || b.city,
    state: a.state || b.state,
    country: a.country || b.country,
    zipCode: a.zipCode || b.zipCode,
    phone: a.phone || b.phone,
    email: a.email || b.email,
    website: a.website || b.website,
    source: a.source,
    sourceUrl: a.sourceUrl,
    scrapedAt: a.scrapedAt,
  };
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
