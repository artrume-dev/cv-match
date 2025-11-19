import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export interface ScrapedJob {
  job_id: string;
  company: string;
  title: string;
  url: string;
  description: string;
  requirements: string;
  tech_stack: string;
  location: string;
  remote: boolean;
}

export abstract class BaseScraper {
  protected company: string;
  protected careersUrl: string;

  constructor(company: string, careersUrl: string) {
    this.company = company;
    this.careersUrl = careersUrl;
  }

  abstract scrape(): Promise<ScrapedJob[]>;

  protected async fetchHtml(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    return await response.text();
  }

  protected loadCheerio(html: string) {
    return cheerio.load(html);
  }

  protected extractTechStack(text: string): string {
    const techKeywords = [
      'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Figma',
      'Storybook', 'Design Tokens', 'CSS', 'HTML', 'GraphQL', 'REST',
      'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'MongoDB', 'PostgreSQL',
      'Git', 'CI/CD', 'TDD', 'Agile', 'Scrum'
    ];

    const found = techKeywords.filter(tech => 
      text.toLowerCase().includes(tech.toLowerCase())
    );

    return found.join(', ');
  }

  protected isRemote(text: string): boolean {
    const remoteKeywords = ['remote', 'work from home', 'distributed', 'anywhere'];
    return remoteKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
  }

  protected generateJobId(company: string, title: string): string {
    const cleaned = `${company}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return cleaned;
  }
}
