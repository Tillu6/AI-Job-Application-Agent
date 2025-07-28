import React from 'react';
import { ApplicationStats } from '../types';
import { TrendingUp, FileCheck, Send, Clock } from 'lucide-react';

interface DashboardProps {
  stats: ApplicationStats;
}

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Jobs Found</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">CVs Tailored</p>
            <p className="text-2xl font-bold text-gray-900">{stats.tailored}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <FileCheck className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Applications Sent</p>
            <p className="text-2xl font-bold text-gray-900">{stats.applied}</p>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <Send className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Avg Match Score</p>
            <p className="text-2xl font-bold text-gray-900">{stats.averageMatchScore}%</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-full">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;