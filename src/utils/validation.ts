import { z } from 'zod';

// Validation schemas
export const JobSearchSchema = z.object({
  keywords: z.array(z.string().min(1)).min(1, 'At least one keyword is required'),
  location: z.string().min(1, 'Location is required'),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'casual']).optional(),
  experience: z.enum(['entry', 'mid', 'senior', 'executive']).optional()
});

export const UserProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^(\+61|0)[0-9]{9}$/, 'Invalid Australian phone number'),
  location: z.string().min(1, 'Location is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  experience: z.array(z.string()).min(1, 'Experience is required'),
  education: z.array(z.string()),
  certifications: z.array(z.string()),
  summary: z.string().min(50, 'Summary must be at least 50 characters')
});

export const CVDataSchema = z.object({
  fileName: z.string(),
  content: z.string().min(100, 'CV content too short'),
  keywords: z.array(z.string()),
  atsScore: z.number().min(0).max(100),
  suggestions: z.array(z.string())
});

export type JobSearchInput = z.infer<typeof JobSearchSchema>;
export type UserProfileInput = z.infer<typeof UserProfileSchema>;
export type CVDataInput = z.infer<typeof CVDataSchema>;