export const config = {
  // API Configuration
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: 'gpt-4-turbo-preview',
    maxTokens: 2000,
    temperature: 0.7
  },
  
  // Job Scraping Configuration
  scraping: {
    maxConcurrentRequests: 5,
    requestDelay: 2000, // 2 seconds between requests
    timeout: 30000, // 30 seconds timeout
    retryAttempts: 3,
    retryDelay: 5000
  },
  
  // Rate Limiting
  rateLimits: {
    jobSearch: {
      points: 10, // Number of requests
      duration: 60 // Per 60 seconds
    },
    cvTailoring: {
      points: 5,
      duration: 60
    },
    coverLetterGeneration: {
      points: 10,
      duration: 60
    }
  },
  
  // Cache Configuration
  cache: {
    jobSearchTTL: 300, // 5 minutes
    cvAnalysisTTL: 3600, // 1 hour
    userProfileTTL: 86400 // 24 hours
  },
  
  // Australian Job Sites
  jobSites: {
    seek: {
      baseUrl: 'https://www.seek.com.au',
      searchEndpoint: '/jobs',
      rateLimit: 1000 // ms between requests
    },
    indeed: {
      baseUrl: 'https://au.indeed.com',
      searchEndpoint: '/jobs',
      rateLimit: 1500
    },
    linkedin: {
      baseUrl: 'https://www.linkedin.com',
      searchEndpoint: '/jobs/search',
      rateLimit: 2000
    }
  }
};

export const validateEnvironment = () => {
  const requiredVars = ['VITE_OPENAI_API_KEY'];
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
    console.warn('Some features may not work properly without these variables.');
  }
};