export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  requirements: string[];
  keywords: string[];
  url: string;
  datePosted: string;
  source: 'seek' | 'indeed' | 'linkedin';
  applicationStatus: 'not_applied' | 'applied' | 'tailored' | 'generating';
  matchScore: number;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  experience: string[];
  education: string[];
  certifications: string[];
  summary: string;
}

export interface CVData {
  fileName: string;
  content: string;
  keywords: string[];
  atsScore: number;
  suggestions: string[];
}

export interface CoverLetter {
  jobId: string;
  content: string;
  generatedAt: string;
}

export interface ApplicationStats {
  totalJobs: number;
  applied: number;
  tailored: number;
  averageMatchScore: number;
}