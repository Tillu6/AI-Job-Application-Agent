import React, { useState } from 'react';
import { Job } from '../types';
import { ExternalLink, MapPin, DollarSign, Calendar, Target, FileEdit, Send, CheckCircle, Loader2 } from 'lucide-react';

interface JobCardProps {
  job: Job;
  isProcessing?: boolean;
  onTailorCV: (jobId: string) => void;
  onGenerateCoverLetter: (jobId: string) => void;
  onApply: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, isProcessing = false, onTailorCV, onGenerateCoverLetter, onApply }) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusBadge = (status: Job['applicationStatus']) => {
    const badges = {
      not_applied: { text: 'Not Applied', color: 'bg-gray-100 text-gray-800' },
      tailored: { text: 'CV Tailored', color: 'bg-blue-100 text-blue-800' },
      generating: { text: 'Generating', color: 'bg-yellow-100 text-yellow-800' },
      applied: { text: 'Applied', color: 'bg-green-100 text-green-800' }
    };
    
    const badge = badges[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const handleAction = async (action: () => void, actionName: string) => {
    setActionLoading(actionName);
    try {
      await action();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
            {getStatusBadge(job.applicationStatus)}
          </div>
          <p className="text-gray-600 font-medium">{job.company}</p>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(job.matchScore)}`}>
          <Target className="inline h-4 w-4 mr-1" />
          {job.matchScore}% match
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          {job.location}
        </div>
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 mr-2" />
          {job.salary}
        </div>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Posted {new Date(job.datePosted).toLocaleDateString()}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Requirements:</h4>
        <div className="flex flex-wrap gap-2">
          {job.requirements.slice(0, 4).map((req, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              {req}
            </span>
          ))}
          {job.requirements.length > 4 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              +{job.requirements.length - 4} more
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleAction(() => onTailorCV(job.id), 'tailor')}
          disabled={actionLoading === 'tailor' || job.applicationStatus === 'applied' || isProcessing}
          className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {(actionLoading === 'tailor' || isProcessing) ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileEdit className="h-4 w-4" />
          )}
          <span>Tailor CV</span>
        </button>

        <button
          onClick={() => handleAction(() => onGenerateCoverLetter(job.id), 'cover')}
          disabled={actionLoading === 'cover' || job.applicationStatus === 'applied' || isProcessing}
          className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {(actionLoading === 'cover' || isProcessing) ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileEdit className="h-4 w-4" />
          )}
          <span>Cover Letter</span>
        </button>

        <button
          onClick={() => handleAction(() => onApply(job.id), 'apply')}
          disabled={actionLoading === 'apply' || job.applicationStatus === 'applied' || isProcessing}
          className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {(actionLoading === 'apply' || isProcessing) ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : job.applicationStatus === 'applied' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span>{job.applicationStatus === 'applied' ? 'Applied' : 'Apply'}</span>
        </button>

        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
        >
          <ExternalLink className="h-4 w-4" />
          <span>View Original</span>
        </a>
      </div>
    </div>
  );
};

export default JobCard;