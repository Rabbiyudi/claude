import axios, { AxiosError } from 'axios';
import { USER_AGENT, RETRY_DELAY_MS, MAX_RETRIES } from './config';

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchPage(url: string, retries = MAX_RETRIES): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
        },
        timeout: 30000,
        maxRedirects: 5,
      });
      return response.data;
    } catch (error) {
      const axiosErr = error as AxiosError;
      const status = axiosErr.response?.status;
      console.error(`  [Attempt ${attempt}/${retries}] Failed to fetch ${url}: ${status || axiosErr.message}`);

      if (status === 403 || status === 451) {
        console.error(`  Access denied (${status}). Skipping.`);
        return null;
      }

      if (attempt < retries) {
        const delay = RETRY_DELAY_MS * attempt;
        console.log(`  Retrying in ${delay / 1000}s...`);
        await sleep(delay);
      }
    }
  }
  return null;
}

export async function fetchJSON<T>(url: string, retries = MAX_RETRIES): Promise<T | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get<T>(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      const axiosErr = error as AxiosError;
      const status = axiosErr.response?.status;
      console.error(`  [Attempt ${attempt}/${retries}] Failed to fetch JSON ${url}: ${status || axiosErr.message}`);

      if (status === 403 || status === 451) {
        return null;
      }

      if (attempt < retries) {
        const delay = RETRY_DELAY_MS * attempt;
        await sleep(delay);
      }
    }
  }
  return null;
}

export function cleanText(text: string | undefined): string {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n/g, ' ')
    .trim();
}

export function extractEmail(text: string): string {
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex);
  return matches ? matches[0] : '';
}

export function extractPhone(text: string): string {
  const phoneRegex = /[\+]?[\d\s\-().]{7,20}/g;
  const matches = text.match(phoneRegex);
  if (!matches) return '';
  const cleaned = matches
    .map(m => m.trim())
    .filter(m => m.replace(/\D/g, '').length >= 7);
  return cleaned[0] || '';
}

export function formatTimestamp(): string {
  return new Date().toISOString();
}

export function progressBar(current: number, total: number, label: string): void {
  const pct = Math.round((current / total) * 100);
  const filled = Math.round(pct / 2);
  const bar = '█'.repeat(filled) + '░'.repeat(50 - filled);
  process.stdout.write(`\r  [${bar}] ${pct}% - ${label}`);
  if (current === total) process.stdout.write('\n');
}
