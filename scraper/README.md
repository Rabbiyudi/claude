# Chabad Center Scraper Bot

A multi-source scraper that collects publicly available contact information for Chabad-Lubavitch centers worldwide, with emphasis on English-speaking countries.

## Features

- **Smart Email Pattern Discovery** - Generates known Chabad website URL patterns (e.g., `chabadof{city}.com`) and extracts contact info from live sites
- **Multi-Source Scraping** - Collects from chabad.org directory, legacy pages, lubavitch.com, and Chabad on Campus
- **Deduplication** - Merges results across sources, keeping the most complete data
- **Export** - Outputs to both CSV (for Excel/Sheets) and JSON (for CRM import)
- **Auto Email** - Sends results via email when scraping completes
- **200+ Cities** - Pre-configured with major cities across US, Canada, UK, Australia, South Africa, New Zealand, and Israel

## Quick Start

```bash
# Install dependencies
npm install

# Run with default settings (English-speaking countries)
npm run scrape

# Run for all countries
npm run scrape:all

# Run only the smart email pattern strategy (fastest)
npm run scrape -- --email-pattern

# Send results via email
npm run scrape -- --send-to=your@email.com
```

## CLI Options

| Flag | Description |
|------|-------------|
| `--all` | Scrape all countries (not just English-speaking) |
| `--email-pattern` | Only use the smart email pattern strategy |
| `--skip-email-pattern` | Skip email pattern strategy, use directory scraping only |
| `--send-to=email` | Send results to this email address |

## Email Configuration

To send results via email, set these environment variables:

```bash
# .env file
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password    # For Gmail: use App Password
SEND_TO=recipient@email.com
```

For Gmail, generate an App Password at: https://myaccount.google.com/apppasswords

## Output

Results are saved in `scraper/output/`:
- `chabad-centers-latest.csv` - Latest results in CSV format
- `chabad-centers-latest.json` - Latest results in JSON format
- `chabad-centers-{timestamp}.csv` - Timestamped backup
- `summary-{timestamp}.txt` - Statistics summary

## Data Fields

Each center record includes:
- **Name** - Center/synagogue name
- **Rabbi** - Rabbi/director name
- **Rebbetzin** - Rebbetzin name
- **Email** - Contact email(s)
- **Phone** - Phone number
- **Address, City, State, Country, Zip**
- **Website** - Center website URL
- **Source** - Which scraper found it
- **Scraped At** - Timestamp

## Scraping Strategy

The bot uses a multi-pronged approach:

1. **Email Pattern Discovery** (Primary) - Tries known URL patterns like `chabadof{city}.com`, `chabad{city}.org`, etc. for 200+ cities. If the site responds, it extracts all contact information.

2. **chabad.org Directory** - Scrapes the public Chabad center directory by country/region.

3. **Legacy Directory** - Uses older chabad.org URL patterns for additional coverage.

4. **lubavitch.com** - Scrapes the Chabad Lubavitch World Headquarters directory.

5. **Chabad on Campus** - Dedicated scraping of campus Chabad centers.

## Architecture

```
scraper/
├── index.ts              # Main entry point & CLI
├── types.ts              # TypeScript interfaces
├── config.ts             # Countries, cities, settings
├── utils.ts              # HTTP client, helpers
├── export.ts             # JSON/CSV export
├── mailer.ts             # Email sending
├── sources/
│   ├── email-pattern.ts  # Smart URL pattern discovery
│   ├── chabad-org.ts     # chabad.org modern directory
│   ├── chabad-org-legacy.ts # chabad.org legacy pages
│   ├── lubavitch-com.ts  # lubavitch.com directory
│   ├── campus-chabad.ts  # Chabad on Campus
│   └── google-search.ts  # Direct website scraping
└── output/               # Results (gitignored)
```
