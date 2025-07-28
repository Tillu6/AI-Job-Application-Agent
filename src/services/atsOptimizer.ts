import { CVData } from '../types';
import { aiService } from './aiService';
import { cacheService } from './cache';
import { AppError } from '../utils/errorHandler';

export class ATSOptimizerService {
  private static async createHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static async analyzeCV(cvContent: string): Promise<CVData> {
    // Create hash for caching
    const cvHash = await this.createHash(cvContent);
    
    // Check cache first
    const cachedAnalysis = cacheService.getCachedCVAnalysis(cvHash);
    if (cachedAnalysis) {
      return cachedAnalysis;
    }

    try {
      // Use AI for comprehensive analysis
      const aiAnalysis = await aiService.analyzeCVForATS(cvContent);
      
      const cvData: CVData = {
        fileName: 'uploaded-cv.pdf',
        content: cvContent,
        keywords: aiAnalysis.keywords,
        atsScore: aiAnalysis.score,
        suggestions: aiAnalysis.suggestions
      };
      
      // Cache the analysis
      cacheService.cacheCVAnalysis(cvHash, cvData);
      
      return cvData;
    } catch (error) {
      // Fallback to basic analysis if AI fails
      console.warn('AI analysis failed, using fallback method:', error);
      return this.basicAnalyzeCV(cvContent);
    }
  }

  private static basicAnalyzeCV(cvContent: string): CVData {
    const keywords = this.extractKeywords(cvContent);
    
    const atsScore = this.calculateATSScore(cvContent, keywords);
    
    const suggestions = this.generateSuggestions(cvContent, atsScore);

    return {
      fileName: 'uploaded-cv.pdf',
      content: cvContent,
      keywords,
      atsScore,
      suggestions
    };
  }

  private static extractKeywords(content: string): string[] {
    const techKeywords = [
      // Frontend Technologies
      'react', 'angular', 'vue', 'javascript', 'typescript', 'html', 'css', 'sass', 'less',
      'jquery', 'bootstrap', 'tailwind', 'webpack', 'vite', 'next.js', 'nuxt.js',
      
      // Backend Technologies
      'node.js', 'express', 'python', 'django', 'flask', 'java', 'spring', 'c#', '.net',
      'php', 'laravel', 'ruby', 'rails', 'go', 'rust', 'scala',
      
      // Databases
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle',
      'sqlite', 'cassandra', 'dynamodb',
      
      // Cloud & DevOps
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github',
      'terraform', 'ansible', 'ci/cd', 'devops', 'microservices',
      
      // Tools & Methodologies
      'git', 'jira', 'confluence', 'agile', 'scrum', 'kanban', 'rest', 'graphql',
      'api', 'testing', 'jest', 'cypress', 'selenium',
      
      // Soft Skills
      'leadership', 'communication', 'problem-solving', 'teamwork', 'project management',
      'analytical', 'creative', 'adaptable', 'detail-oriented'
    ];

    const foundKeywords: string[] = [];
    const lowerContent = content.toLowerCase();

    techKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
      }
    });

    return [...new Set(foundKeywords)];
  }

  private static calculateATSScore(content: string, keywords: string[]): number {
    let score = 0;
    const lowerContent = content.toLowerCase();
    
    // Essential sections (40 points total)
    if (lowerContent.includes('experience') || lowerContent.includes('employment')) score += 15;
    if (lowerContent.includes('education') || lowerContent.includes('qualification')) score += 10;
    if (lowerContent.includes('skills') || lowerContent.includes('competencies')) score += 10;
    if (lowerContent.includes('summary') || lowerContent.includes('profile')) score += 5;
    
    // Keywords density (25 points)
    const keywordScore = Math.min(keywords.length * 1.5, 25);
    score += keywordScore;
    
    // Content length optimization (15 points)
    const wordCount = content.split(' ').length;
    if (wordCount >= 400 && wordCount <= 1000) {
      score += 15;
    } else if (wordCount >= 200 && wordCount <= 1500) {
      score += 10;
    } else if (wordCount >= 100) {
      score += 5;
    }
    
    // Formatting and structure (20 points)
    if (content.includes('•') || content.includes('-') || content.includes('*')) score += 8;
    if (lowerContent.includes('achievements') || lowerContent.includes('accomplishments')) score += 5;
    if (content.match(/\d+/g)?.length > 5) score += 4; // Numbers/metrics
    if (content.match(/[A-Z][a-z]+ \d{4}/g)) score += 3; // Dates

    return Math.min(score, 100);
  }

  private static generateSuggestions(content: string, score: number): string[] {
    const suggestions: string[] = [];
    const lowerContent = content.toLowerCase();

    if (score < 60) {
      suggestions.push('Add more relevant keywords from job descriptions');
      suggestions.push('Include a professional summary section');
      suggestions.push('Use bullet points to improve readability');
      suggestions.push('Add quantifiable achievements with specific numbers');
    }

    if (!lowerContent.includes('achievements') && !lowerContent.includes('accomplishments')) {
      suggestions.push('Add quantifiable achievements and metrics');
    }

    if (!lowerContent.includes('projects') && !lowerContent.includes('portfolio')) {
      suggestions.push('Include relevant projects section');
    }

    if (score < 75) {
      suggestions.push('Use action verbs to start bullet points');
      suggestions.push('Tailor skills section to match job requirements');
      suggestions.push('Include relevant certifications and training');
      suggestions.push('Add contact information at the top');
    }

    // Word count suggestions
    const wordCount = content.split(' ').length;
    if (wordCount < 300) {
      suggestions.push('CV is too short - add more detail about your experience');
    } else if (wordCount > 1200) {
      suggestions.push('CV is too long - consider condensing to 1-2 pages');
    }

    // Format suggestions
    if (!content.includes('•') && !content.includes('-')) {
      suggestions.push('Use bullet points for better readability');
    }

    if (!content.match(/\d+/g) || content.match(/\d+/g)!.length < 3) {
      suggestions.push('Include more specific numbers and metrics');
    }

    return suggestions;
  }

  static async tailorCVForJob(cvContent: string, jobKeywords: string[], job?: any, userProfile?: any): Promise<string> {
    try {
      // Use AI service for sophisticated tailoring
      if (job && userProfile) {
        return await aiService.tailorCVForJob(cvContent, job, userProfile);
      }
    } catch (error) {
      console.warn('AI tailoring failed, using fallback method:', error);
    }

    // Fallback to basic tailoring
    return this.basicTailorCV(cvContent, jobKeywords);
  }

  private static basicTailorCV(cvContent: string, jobKeywords: string[]): string {
    let tailoredCV = cvContent;

    const cvKeywords = this.extractKeywords(cvContent);
    const missingKeywords = jobKeywords.filter(keyword => 
      !cvKeywords.some(cvKeyword => cvKeyword.toLowerCase() === keyword.toLowerCase())
    );

    if (missingKeywords.length > 0) {
      const skillsSection = `\n\nRELEVANT TECHNICAL SKILLS:\n• ${missingKeywords.slice(0, 8).join('\n• ')}`;
      tailoredCV += skillsSection;
    }

    return tailoredCV;
  }

  static calculateMatchScore(cvContent: string, jobKeywords: string[], jobRequirements: string[]): number {
    const cvKeywords = this.extractKeywords(cvContent);
    const lowerCvContent = cvContent.toLowerCase();
    
    let matchScore = 0;
    let totalPossibleScore = 0;
    
    // Keyword matching (60% of score)
    jobKeywords.forEach(keyword => {
      totalPossibleScore += 3;
      if (cvKeywords.some(cvKeyword => 
        cvKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(cvKeyword.toLowerCase())
      )) {
        matchScore += 3;
      }
    });
    
    // Requirements matching (40% of score)
    jobRequirements.forEach(requirement => {
      totalPossibleScore += 2;
      if (lowerCvContent.includes(requirement.toLowerCase())) {
        matchScore += 2;
      }
    });
    
    return totalPossibleScore > 0 ? Math.round((matchScore / totalPossibleScore) * 100) : 0;
  }
}