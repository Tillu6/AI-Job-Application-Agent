import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Job } from '../types';
import { JobScraperService } from '../services/jobScraper';
import { handleError, logError } from '../utils/errorHandler';
import { JobSearchSchema, JobSearchInput } from '../utils/validation';

interface UseJobsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useJobs = (options: UseJobsOptions = {}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchParams, setSearchParams] = useState<JobSearchInput | null>(null);
  const queryClient = useQueryClient();

  // Query for job search
  const {
    data: searchResults,
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery(
    {
      queryKey: ['jobs', searchParams],
      queryFn: async () => {
        if (!searchParams) return [];
        const scraper = JobScraperService.getInstance();
        return await scraper.scrapeJobs(searchParams.keywords, searchParams.location);
      },
      enabled: !!searchParams,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchInterval: options.autoRefresh ? (options.refreshInterval || 30000) : false,
      onError: (err) => {
        const appError = handleError(err);
        logError(appError, { searchParams });
      }
    }
  );

  // Mutation for updating job status
  const updateJobMutation = useMutation(
    {
      mutationFn: async ({ jobId, status }: { jobId: string; status: Job['applicationStatus'] }) => {
        // In a real app, this would make an API call
        return { jobId, status };
      },
      onSuccess: ({ jobId, status }) => {
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job.id === jobId ? { ...job, applicationStatus: status } : job
          )
        );
        
        // Update query cache
        queryClient.setQueryData(['jobs', searchParams], (oldData: Job[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map(job => 
            job.id === jobId ? { ...job, applicationStatus: status } : job
          );
        });
      },
      onError: (err) => {
        const appError = handleError(err);
        logError(appError, { context: 'updateJobMutation' });
      }
    }
  );

  // Update jobs when search results change
  useEffect(() => {
    if (searchResults) {
      setJobs(searchResults);
    }
  }, [searchResults]);

  const searchJobs = async (keywords: string[], location: string = 'Australia') => {
    try {
      // Validate input
      const validatedInput = JobSearchSchema.parse({ keywords, location });
      setSearchParams(validatedInput);
    } catch (err) {
      const appError = handleError(err);
      logError(appError, { keywords, location });
      throw appError;
    }
  };

  const updateJobStatus = (jobId: string, status: Job['applicationStatus']) => {
    updateJobMutation.mutate({ jobId, status });
  };

  const refreshJobs = () => {
    refetch();
  };

  const clearJobs = () => {
    setJobs([]);
    setSearchParams(null);
    queryClient.removeQueries(['jobs']);
  };

  return {
    jobs,
    loading,
    error: queryError ? handleError(queryError).message : null,
    searchJobs,
    updateJobStatus,
    refreshJobs,
    clearJobs,
    isUpdating: updateJobMutation.isLoading
  };
};