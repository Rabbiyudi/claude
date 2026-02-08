import * as fs from 'fs';
import * as path from 'path';
import { ChabadCenter } from './types';

export function exportToJSON(centers: ChabadCenter[], outputPath: string): void {
  const data = {
    metadata: {
      totalCenters: centers.length,
      exportedAt: new Date().toISOString(),
      sources: [...new Set(centers.map(c => c.source))],
      countries: [...new Set(centers.map(c => c.country).filter(Boolean))],
    },
    centers,
  };

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`  Exported ${centers.length} centers to ${outputPath}`);
}

export function exportToCSV(centers: ChabadCenter[], outputPath: string): void {
  const headers = [
    'Name', 'Rabbi', 'Rebbetzin', 'Email', 'Phone',
    'Address', 'City', 'State', 'Country', 'Zip Code',
    'Website', 'Source', 'Source URL', 'Scraped At',
  ];

  const escapeCSV = (val: string): string => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const rows = centers.map(c => [
    c.name, c.rabbi, c.rebbetzin, c.email, c.phone,
    c.address, c.city, c.state, c.country, c.zipCode,
    c.website, c.source, c.sourceUrl, c.scrapedAt,
  ].map(escapeCSV).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  fs.writeFileSync(outputPath, csv, 'utf-8');
  console.log(`  Exported ${centers.length} centers to ${outputPath}`);
}

export function ensureOutputDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function generateSummary(centers: ChabadCenter[]): string {
  const byCountry = new Map<string, number>();
  const bySource = new Map<string, number>();
  let withEmail = 0;
  let withPhone = 0;
  let withRabbi = 0;
  let withWebsite = 0;

  for (const c of centers) {
    const country = c.country || 'Unknown';
    byCountry.set(country, (byCountry.get(country) || 0) + 1);
    bySource.set(c.source, (bySource.get(c.source) || 0) + 1);
    if (c.email) withEmail++;
    if (c.phone) withPhone++;
    if (c.rabbi) withRabbi++;
    if (c.website) withWebsite++;
  }

  const lines: string[] = [
    '=== CHABAD SCRAPER RESULTS SUMMARY ===',
    `Total Centers Found: ${centers.length}`,
    `With Email: ${withEmail} (${Math.round(withEmail / centers.length * 100)}%)`,
    `With Phone: ${withPhone} (${Math.round(withPhone / centers.length * 100)}%)`,
    `With Rabbi Name: ${withRabbi} (${Math.round(withRabbi / centers.length * 100)}%)`,
    `With Website: ${withWebsite} (${Math.round(withWebsite / centers.length * 100)}%)`,
    '',
    '--- By Country ---',
    ...[...byCountry.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([country, count]) => `  ${country}: ${count}`),
    '',
    '--- By Source ---',
    ...[...bySource.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => `  ${source}: ${count}`),
  ];

  return lines.join('\n');
}
