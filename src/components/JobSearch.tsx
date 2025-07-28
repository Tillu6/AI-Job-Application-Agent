import React, { useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface JobSearchProps {
  onSearch: (keywords: string[], location: string) => void;
  loading: boolean;
}

const JobSearch: React.FC<JobSearchProps> = ({ onSearch, loading }) => {
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('Australia');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keywords.trim()) {
      const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
      onSearch(keywordArray, location);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
      <h2 className="text-lg font-semibold mb-4">Search Jobs</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Keywords (e.g., React, Python, DevOps)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
          
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none"
            >
              <option value="Australia">All Australia</option>
              <option value="Sydney, NSW">Sydney, NSW</option>
              <option value="Melbourne, VIC">Melbourne, VIC</option>
              <option value="Brisbane, QLD">Brisbane, QLD</option>
              <option value="Perth, WA">Perth, WA</option>
              <option value="Adelaide, SA">Adelaide, SA</option>
            </select>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading || !keywords.trim()}
          className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>Search Jobs</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default JobSearch;