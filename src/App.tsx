import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import JobSearch from './components/JobSearch';
import JobCard from './components/JobCard';
import CVAnalyzer from './components/CVAnalyzer';
import UserProfile from './components/UserProfile';
import { useJobs } from './hooks/useJobs';
import { Job, UserProfile as UserProfileType, CVData, ApplicationStats } from './types';
import { aiService } from './services/aiService';
import { handleError, logError } from './utils/errorHandler';
import { config, validateEnvironment } from './config/environment';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

function AppContent() {
  const { jobs, loading, error, searchJobs, updateJobStatus } = useJobs();
  const [cvData, setCVData] = useState<CVData | null>(null);
  const [processingJobs, setProcessingJobs] = useState<Set<string>>(new Set());
  const [userProfile, setUserProfile] = useState<UserProfileType>({
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+61 400 123 456',
    location: 'Sydney, NSW',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Python'],
    experience: [
      'Senior Software Engineer with 5+ years experience in full-stack development',
      'Led development of scalable web applications serving 100k+ users',
      'Expertise in React, Node.js, and cloud technologies'
    ],
    education: ['Bachelor of Computer Science, University of Sydney'],
    certifications: ['AWS Certified Developer'],
    summary: 'Experienced software engineer passionate about building innovative solutions'
  });

  const [stats, setStats] = useState<ApplicationStats>({
    totalJobs: 0,
    applied: 0,
    tailored: 0,
    averageMatchScore: 0
  });

  // Validate environment on mount
  useEffect(() => {
    validateEnvironment();
  }, []);

  useEffect(() => {
    const appliedJobs = jobs.filter(job => job.applicationStatus === 'applied').length;
    const tailoredJobs = jobs.filter(job => job.applicationStatus === 'tailored').length;
    const averageScore = jobs.length > 0 ? Math.round(jobs.reduce((sum, job) => sum + job.matchScore, 0) / jobs.length) : 0;

    setStats({
      totalJobs: jobs.length,
      applied: appliedJobs,
      tailored: tailoredJobs,
      averageMatchScore: averageScore
    });
  }, [jobs]);

  const handleTailorCV = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job || !cvData) return;

    setProcessingJobs(prev => new Set(prev).add(jobId));
    
    try {
      const tailoredCV = await aiService.tailorCVForJob(cvData.content, job, userProfile);
      
      // In a real app, you would save this tailored CV
      console.log('Tailored CV for job:', job.title);
      console.log('Tailored CV content:', tailoredCV);
      
      updateJobStatus(jobId, 'tailored');
      
      // Show success notification (you could add a toast library)
      alert('CV successfully tailored for this position!');
    } catch (err) {
      const appError = handleError(err);
      logError(appError, { jobId, jobTitle: job.title });
      alert(`Failed to tailor CV: ${appError.message}`);
    } finally {
      setProcessingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleGenerateCoverLetter = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    setProcessingJobs(prev => new Set(prev).add(jobId));
    
    try {
      const coverLetter = await aiService.generateCoverLetter(job, userProfile);
      
      console.log('Generated cover letter for job:', job.title);
      console.log('Cover letter content:', coverLetter);
      
      // In a real app, you would save this cover letter
      alert('Cover letter generated successfully!');
    } catch (err) {
      const appError = handleError(err);
      logError(appError, { jobId, jobTitle: job.title });
      alert(`Failed to generate cover letter: ${appError.message}`);
    } finally {
      setProcessingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleApply = (jobId: string) => {
    updateJobStatus(jobId, 'applied');
    console.log('Applied to job:', jobId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard stats={stats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <JobSearch onSearch={searchJobs} loading={loading} />
            
            <div>
              <h2 className="text-xl font-semibold mb-6">Available Jobs</h2>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                  {error}
                </div>
              )}
              
              {jobs.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                  <p>No jobs found. Try searching with different keywords.</p>
                </div>
              )}
              
              <div className="space-y-6">
                {jobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isProcessing={processingJobs.has(job.id)}
                    onTailorCV={handleTailorCV}
                    onGenerateCoverLetter={handleGenerateCoverLetter}
                    onApply={handleApply}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <UserProfile 
              profile={userProfile}
              onProfileUpdate={setUserProfile}
            />
            
            <CVAnalyzer onCVAnalyzed={setCVData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;