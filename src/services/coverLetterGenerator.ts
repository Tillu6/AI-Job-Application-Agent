import { Job, UserProfile, CoverLetter } from '../types';

export class CoverLetterGeneratorService {
  static generateCoverLetter(job: Job, userProfile: UserProfile): CoverLetter {
    const content = this.createCoverLetterContent(job, userProfile);
    
    return {
      jobId: job.id,
      content,
      generatedAt: new Date().toISOString()
    };
  }

  private static createCoverLetterContent(job: Job, userProfile: UserProfile): string {
    const currentDate = new Date().toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return `${currentDate}

Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company}. With my background in ${userProfile.skills.slice(0, 3).join(', ')}, I am excited about the opportunity to contribute to your team's success.

In my previous roles, I have developed expertise in ${this.getRelevantSkills(job.keywords, userProfile.skills).join(', ')}, which directly aligns with your requirements. My experience includes:

${this.generateExperiencePoints(job, userProfile)}

I am particularly drawn to this role because ${this.generateJobSpecificReason(job)}. Your requirement for ${job.requirements[0]} resonates with my professional goals, and I am confident that my ${this.getMatchingSkills(job.keywords, userProfile.skills)[0]} experience would be valuable to your team.

I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to ${job.company}'s continued success. Thank you for considering my application.

Sincerely,
${userProfile.name}
${userProfile.email}
${userProfile.phone}`;
  }

  private static getRelevantSkills(jobKeywords: string[], userSkills: string[]): string[] {
    return userSkills.filter(skill => 
      jobKeywords.some(keyword => 
        skill.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(skill.toLowerCase())
      )
    ).slice(0, 4);
  }

  private static getMatchingSkills(jobKeywords: string[], userSkills: string[]): string[] {
    return this.getRelevantSkills(jobKeywords, userSkills);
  }

  private static generateExperiencePoints(job: Job, userProfile: UserProfile): string {
    const relevantExperience = userProfile.experience.slice(0, 3);
    return relevantExperience.map(exp => `• ${exp}`).join('\n');
  }

  private static generateJobSpecificReason(job: Job): string {
    const reasons = [
      `it offers the opportunity to work with cutting-edge technologies in ${job.location}`,
      `${job.company} has a reputation for innovation and excellence in the industry`,
      `the role aligns perfectly with my career goals and technical interests`,
      `it provides the chance to make a meaningful impact in a growing organization`
    ];
    
    return reasons[Math.floor(Math.random() * reasons.length)];
  }
}