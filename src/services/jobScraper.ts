import { Job } from '../types';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { config } from '../config/environment';
import { AppError, ScrapingError } from '../utils/errorHandler';
import { rateLimiter } from './rateLimiter';
import { cacheService } from './cache';
import { aiService } from './aiService';

export class JobScraperService {
  private static instance: JobScraperService;
  private axiosInstance;
  
  constructor() {
    this.axiosInstance = axios.create({
      timeout: config.scraping.timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Add retry logic
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const { config: axiosConfig } = error;
        if (!axiosConfig || !axiosConfig.retry) {
          axiosConfig.retry = 0;
        }

        if (axiosConfig.retry < config.scraping.retryAttempts) {
          axiosConfig.retry++;
          await new Promise(resolve => setTimeout(resolve, config.scraping.retryDelay));
          return this.axiosInstance(axiosConfig);
        }

        return Promise.reject(error);
      }
    );
  }

  static getInstance(): JobScraperService {
    if (!JobScraperService.instance) {
      JobScraperService.instance = new JobScraperService();
    }
    return JobScraperService.instance;
  }

  async scrapeJobs(keywords: string[], location: string = 'Australia'): Promise<Job[]> {
    await rateLimiter.checkLimit('jobSearch');
    
    // Check cache first
    const cacheKey = keywords.join(',') + ':' + location;
    const cachedResults = cacheService.getCachedJobSearch(cacheKey, location);
    if (cachedResults) {
      return cachedResults;
    }

    try {
      const allJobs: Job[] = [];
      
      // Scrape from multiple sources concurrently with rate limiting
      const scrapingPromises = [
        this.scrapeSeek(keywords, location),
        this.scrapeIndeed(keywords, location),
        // LinkedIn scraping would require special handling due to anti-bot measures
      ];

      const results = await Promise.allSettled(scrapingPromises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allJobs.push(...result.value);
        } else {
          console.error(`Scraping failed for source ${index}:`, result.reason);
        }
      });

      // Remove duplicates based on title and company
      const uniqueJobs = this.removeDuplicates(allJobs);
      
      // Enhance jobs with AI-extracted keywords
      const enhancedJobs = await this.enhanceJobsWithAI(uniqueJobs);
      
      // Cache results
      cacheService.cacheJobSearch(cacheKey, location, enhancedJobs);
      
      return enhancedJobs;
    } catch (error) {
      throw new ScrapingError('Failed to scrape jobs from all sources');
    }
  }

  private async scrapeSeek(keywords: string[], location: string): Promise<Job[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, config.jobSites.seek.rateLimit));
      
      const searchUrl = this.buildSeekUrl(keywords, location);
      const response = await this.axiosInstance.get(searchUrl);
      const $ = cheerio.load(response.data);
      
      const jobs: Job[] = [];
      
      $('[data-automation="normalJob"]').each((index, element) => {
        try {
          const $job = $(element);
          const title = $job.find('[data-automation="jobTitle"]').text().trim();
          const company = $job.find('[data-automation="jobCompany"]').text().trim();
          const location = $job.find('[data-automation="jobLocation"]').text().trim();
          const salary = $job.find('[data-automation="jobSalary"]').text().trim() || 'Not specified';
          const url = 'https://www.seek.com.au' + $job.find('[data-automation="jobTitle"] a').attr('href');
          
          if (title && company) {
            jobs.push({
              id: `seek_${Date.now()}_${index}`,
              title,
              company,
              location,
              salary,
              description: '', // Will be filled by detailed scraping
              requirements: [],
              keywords: [],
              url,
              datePosted: new Date().toISOString().split('T')[0],
              source: 'seek',
              applicationStatus: 'not_applied',
              matchScore: 0
            });
          }
        } catch (error) {
          console.error('Error parsing job element:', error);
        }
      });
      
      // Get detailed information for each job
      const detailedJobs = await this.getJobDetails(jobs.slice(0, 10)); // Limit to prevent rate limiting
      
      return detailedJobs;
    } catch (error) {
      throw new ScrapingError('Failed to scrape Seek', 'seek');
    }
  }

  private async scrapeIndeed(keywords: string[], location: string): Promise<Job[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, config.jobSites.indeed.rateLimit));
      
      const searchUrl = this.buildIndeedUrl(keywords, location);
      const response = await this.axiosInstance.get(searchUrl);
      const $ = cheerio.load(response.data);
      
      const jobs: Job[] = [];
      
      $('.job_seen_beacon').each((index, element) => {
        try {
          const $job = $(element);
          const title = $job.find('.jobTitle a span').text().trim();
          const company = $job.find('.companyName').text().trim();
          const location = $job.find('.companyLocation').text().trim();
          const salary = $job.find('.salary-snippet').text().trim() || 'Not specified';
          const url = 'https://au.indeed.com' + $job.find('.jobTitle a').attr('href');
          
          if (title && company) {
            jobs.push({
              id: `indeed_${Date.now()}_${index}`,
              title,
              company,
              location,
              salary,
              description: '',
              requirements: [],
              keywords: [],
              url,
              datePosted: new Date().toISOString().split('T')[0],
              source: 'indeed',
              applicationStatus: 'not_applied',
              matchScore: 0
            });
          }
        } catch (error) {
          console.error('Error parsing Indeed job element:', error);
        }
      });
      
      return jobs.slice(0, 10); // Limit results
    } catch (error) {
      throw new ScrapingError('Failed to scrape Indeed', 'indeed');
    }
  }

  private buildSeekUrl(keywords: string[], location: string): string {
    const baseUrl = 'https://www.seek.com.au/jobs';
    const params = new URLSearchParams({
      q: keywords.join(' '),
      where: location,
      sortmode: 'ListedDate'
    });
    return `${baseUrl}?${params.toString()}`;
  }

  private buildIndeedUrl(keywords: string[], location: string): string {
    const baseUrl = 'https://au.indeed.com/jobs';
    const params = new URLSearchParams({
      q: keywords.join(' '),
      l: location,
      sort: 'date'
    });
    return `${baseUrl}?${params.toString()}`;
  }

  private async getJobDetails(jobs: Job[]): Promise<Job[]> {
    const detailedJobs: Job[] = [];
    
    for (const job of jobs) {
      try {
        await new Promise(resolve => setTimeout(resolve, config.scraping.requestDelay));
        
        const response = await this.axiosInstance.get(job.url);
        const $ = cheerio.load(response.data);
        
        // Extract job description (this varies by site structure)
        const description = $('.jobAdDetails, .jobsearch-jobDescriptionText, [data-automation="jobAdDetails"]')
          .text()
          .trim()
          .substring(0, 1000); // Limit description length
        
        // Extract requirements using simple text analysis
        const requirements = this.extractRequirements(description);
        
        detailedJobs.push({
          ...job,
          description,
          requirements
        });
      } catch (error) {
        console.error(`Failed to get details for job ${job.id}:`, error);
        // Add job without detailed info
        detailedJobs.push(job);
      }
    }
    
    return detailedJobs;
  }

  private extractRequirements(description: string): string[] {
    const requirements: string[] = [];
    const lowerDesc = description.toLowerCase();
    
    // Common tech skills and requirements
    const skillPatterns = [
      /\b(react|angular|vue|javascript|typescript|node\.?js|python|java|c#|php|ruby)\b/gi,
      /\b(aws|azure|gcp|docker|kubernetes|git|sql|mongodb|postgresql)\b/gi,
      /\b(agile|scrum|devops|ci\/cd|rest|api|microservices)\b/gi,
      /\b(\d+\+?\s*years?\s*experience)\b/gi,
      /\b(bachelor|degree|certification|diploma)\b/gi
    ];
    
    skillPatterns.forEach(pattern => {
      const matches = description.match(pattern);
      if (matches) {
        requirements.push(...matches.map(match => match.trim()));
      }
    });
    
    return [...new Set(requirements)].slice(0, 10); // Remove duplicates and limit
  }

  private removeDuplicates(jobs: Job[]): Job[] {
    const seen = new Set<string>();
    return jobs.filter(job => {
      const key = `${job.title.toLowerCase()}_${job.company.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private async enhanceJobsWithAI(jobs: Job[]): Promise<Job[]> {
    const enhancedJobs: Job[] = [];
    
    for (const job of jobs) {
      try {
        // Extract keywords using AI
        const keywords = await aiService.extractJobKeywords(job.description, job.title);
        
        // Calculate match score (simplified - in production, this would compare against user profile)
        const matchScore = Math.floor(Math.random() * 40) + 60; // Mock score between 60-100
        
        enhancedJobs.push({
          ...job,
          keywords,
          matchScore
        });
      } catch (error) {
        console.error(`Failed to enhance job ${job.id} with AI:`, error);
        enhancedJobs.push(job);
      }
    }
    
    return enhancedJobs;
  }

  // Fallback to mock data if scraping fails
  private async getMockJobs(keywords: string[]): Promise<Job[]> {
    
    const mockJobs: Job[] = [
      {
        id: '1',
        title: 'Senior Software Engineer',
        company: 'TechCorp Australia',
        location: 'Sydney, NSW',
        salary: '$120,000 - $150,000',
        description: 'We are seeking a Senior Software Engineer to join our growing team...',
        requirements: ['React', 'TypeScript', 'Node.js', '5+ years experience', 'AWS'],
        keywords: ['react', 'typescript', 'nodejs', 'aws', 'senior', 'software'],
        url: 'https://seek.com.au/job/12345',
        datePosted: '2025-01-09',
        source: 'seek',
        applicationStatus: 'not_applied',
        matchScore: 85
      },
      {
        id: '2',
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        location: 'Melbourne, VIC',
        salary: '$90,000 - $110,000',
        description: 'Join our innovative startup as a Full Stack Developer...',
        requirements: ['JavaScript', 'Python', 'Django', 'React', '3+ years experience'],
        keywords: ['javascript', 'python', 'django', 'react', 'fullstack'],
        url: 'https://indeed.com.au/job/67890',
        datePosted: '2025-01-08',
        source: 'indeed',
        applicationStatus: 'not_applied',
        matchScore: 78
      },
      {
        id: '3',
        title: 'DevOps Engineer',
        company: 'CloudTech Solutions',
        location: 'Brisbane, QLD',
        salary: '$100,000 - $130,000',
        description: 'Looking for a DevOps Engineer to manage our cloud infrastructure...',
        requirements: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
        keywords: ['aws', 'docker', 'kubernetes', 'devops', 'linux'],
        url: 'https://linkedin.com/jobs/view/98765',
        datePosted: '2025-01-07',
        source: 'linkedin',
        applicationStatus: 'not_applied',
        matchScore: 72
      }
    ];

    return mockJobs.filter(job => 
      keywords.some(keyword => 
        job.keywords.some(jobKeyword => 
          jobKeyword.toLowerCase().includes(keyword.toLowerCase())
        )
      )
    );
  }

  async getJobDetails(jobId: string): Promise<Job | null> {
    try {
      const jobs = await this.scrapeJobs(['software', 'developer', 'engineer']);
      return jobs.find(job => job.id === jobId) || null;
    } catch (error) {
      console.error('Failed to get job details:', error);
      return null;
    }
  }
}