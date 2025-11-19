import { ScrapedJob } from './base.js';
import { greenhouseCompanies } from './greenhouse.js';
import { leverCompanies } from './lever.js';

export * from './base.js';
export * from './greenhouse.js';
export * from './lever.js';

// Central registry of all scrapers
export const allScrapers = {
  ...greenhouseCompanies,
  ...leverCompanies,
};

/**
 * Run all scrapers and return aggregated results
 */
export async function scrapeAllCompanies(): Promise<ScrapedJob[]> {
  const results: ScrapedJob[] = [];
  
  for (const [company, scraper] of Object.entries(allScrapers)) {
    try {
      console.log(`Scraping ${company}...`);
      const jobs = await scraper.scrape();
      results.push(...jobs);
      console.log(`Found ${jobs.length} relevant jobs from ${company}`);
    } catch (error) {
      console.error(`Error scraping ${company}:`, error);
    }
  }
  
  return results;
}

/**
 * Scrape specific companies
 */
export async function scrapeCompanies(companyNames: string[]): Promise<ScrapedJob[]> {
  const results: ScrapedJob[] = [];
  
  for (const name of companyNames) {
    const key = name.toLowerCase().replace(/\s+/g, '');
    const scraper = allScrapers[key as keyof typeof allScrapers];
    
    if (!scraper) {
      console.warn(`No scraper found for ${name}`);
      continue;
    }
    
    try {
      console.log(`Scraping ${name}...`);
      const jobs = await scraper.scrape();
      results.push(...jobs);
      console.log(`Found ${jobs.length} relevant jobs from ${name}`);
    } catch (error) {
      console.error(`Error scraping ${name}:`, error);
    }
  }
  
  return results;
}
