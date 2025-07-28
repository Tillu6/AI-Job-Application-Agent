import OpenAI from 'openai';
import { config } from '../config/environment';
import { Job, UserProfile } from '../types';
import { AppError } from '../utils/errorHandler';
import { rateLimiter } from './rateLimiter';

class AIService {
  private openai: OpenAI | null = null;

  constructor() {
    if (config.openai.apiKey) {
      this.openai = new OpenAI({
        apiKey: config.openai.apiKey,
        dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
      });
    }
  }

  private ensureOpenAI(): OpenAI {
    if (!this.openai) {
      throw new AppError('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY environment variable.', 500);
    }
    return this.openai;
  }

  async tailorCVForJob(cvContent: string, job: Job, userProfile: UserProfile): Promise<string> {
    await rateLimiter.checkLimit('cvTailoring');
    
    const openai = this.ensureOpenAI();

    const prompt = `
You are an expert CV writer and ATS optimization specialist. Tailor the following CV for the specific job posting while maintaining truthfulness and the candidate's core experience.

ORIGINAL CV:
${cvContent}

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Requirements: ${job.requirements.join(', ')}
Keywords: ${job.keywords.join(', ')}
Description: ${job.description}

INSTRUCTIONS:
1. Optimize the CV for ATS systems by incorporating relevant keywords naturally
2. Reorder and emphasize experiences that match the job requirements
3. Adjust the professional summary to align with the role
4. Ensure all claims remain truthful to the original CV
5. Maintain professional formatting and structure
6. Keep the CV length appropriate (1-2 pages)
7. Use action verbs and quantifiable achievements
8. Ensure keyword density is natural, not stuffed

Return only the tailored CV content, properly formatted.
`;

    try {
      const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.openai.maxTokens,
        temperature: config.openai.temperature
      });

      const tailoredCV = response.choices[0]?.message?.content;
      if (!tailoredCV) {
        throw new AppError('Failed to generate tailored CV', 500);
      }

      return tailoredCV.trim();
    } catch (error: any) {
      if (error.code === 'insufficient_quota') {
        throw new AppError('OpenAI API quota exceeded. Please check your billing.', 503);
      }
      throw new AppError(`AI service error: ${error.message}`, 500);
    }
  }

  async generateCoverLetter(job: Job, userProfile: UserProfile): Promise<string> {
    await rateLimiter.checkLimit('coverLetterGeneration');
    
    const openai = this.ensureOpenAI();

    const prompt = `
Write a compelling, personalized cover letter for the following job application. The letter should be professional, engaging, and specifically tailored to the role and company.

JOB DETAILS:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Requirements: ${job.requirements.join(', ')}
Description: ${job.description}

CANDIDATE PROFILE:
Name: ${userProfile.name}
Email: ${userProfile.email}
Phone: ${userProfile.phone}
Location: ${userProfile.location}
Skills: ${userProfile.skills.join(', ')}
Experience: ${userProfile.experience.join('; ')}
Education: ${userProfile.education.join(', ')}
Summary: ${userProfile.summary}

REQUIREMENTS:
1. Address the hiring manager professionally
2. Open with a strong hook that shows enthusiasm for the specific role
3. Highlight 2-3 most relevant experiences that match job requirements
4. Show knowledge of the company and role
5. Include specific examples with quantifiable results where possible
6. Close with a strong call to action
7. Keep it concise (3-4 paragraphs)
8. Use Australian English spelling and business format
9. Make it sound human and authentic, not robotic

Format the letter properly with date, address, and signature block.
`;

    try {
      const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.openai.maxTokens,
        temperature: config.openai.temperature
      });

      const coverLetter = response.choices[0]?.message?.content;
      if (!coverLetter) {
        throw new AppError('Failed to generate cover letter', 500);
      }

      return coverLetter.trim();
    } catch (error: any) {
      if (error.code === 'insufficient_quota') {
        throw new AppError('OpenAI API quota exceeded. Please check your billing.', 503);
      }
      throw new AppError(`AI service error: ${error.message}`, 500);
    }
  }

  async analyzeCVForATS(cvContent: string): Promise<{
    score: number;
    keywords: string[];
    suggestions: string[];
    strengths: string[];
    weaknesses: string[];
  }> {
    const openai = this.ensureOpenAI();

    const prompt = `
Analyze the following CV for ATS (Applicant Tracking System) compatibility and provide a detailed assessment.

CV CONTENT:
${cvContent}

Provide a JSON response with the following structure:
{
  "score": <number between 0-100>,
  "keywords": [<array of detected technical and professional keywords>],
  "suggestions": [<array of specific improvement suggestions>],
  "strengths": [<array of current strengths>],
  "weaknesses": [<array of areas needing improvement>]
}

Consider these ATS factors:
- Keyword optimization and density
- Formatting and structure
- Section headers and organization
- Use of action verbs and quantifiable achievements
- Contact information clarity
- File format compatibility
- Length and readability
- Industry-specific terminology
- Skills section completeness
- Experience relevance and presentation
`;

    try {
      const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.3
      });

      const analysis = response.choices[0]?.message?.content;
      if (!analysis) {
        throw new AppError('Failed to analyze CV', 500);
      }

      return JSON.parse(analysis);
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        throw new AppError('Failed to parse CV analysis response', 500);
      }
      throw new AppError(`AI service error: ${error.message}`, 500);
    }
  }

  async extractJobKeywords(jobDescription: string, jobTitle: string): Promise<string[]> {
    const openai = this.ensureOpenAI();

    const prompt = `
Extract the most important keywords from this job posting that would be relevant for ATS optimization. Focus on technical skills, qualifications, and key requirements.

JOB TITLE: ${jobTitle}
JOB DESCRIPTION: ${jobDescription}

Return a JSON array of keywords, prioritized by importance. Include:
- Technical skills and technologies
- Soft skills mentioned
- Qualifications and certifications
- Industry-specific terms
- Experience levels
- Tools and platforms

Limit to 20 most important keywords.
`;

    try {
      const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.2
      });

      const keywords = response.choices[0]?.message?.content;
      if (!keywords) {
        throw new AppError('Failed to extract keywords', 500);
      }

      return JSON.parse(keywords);
    } catch (error: any) {
      throw new AppError(`Keyword extraction error: ${error.message}`, 500);
    }
  }
}

export const aiService = new AIService();