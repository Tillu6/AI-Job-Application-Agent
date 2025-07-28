import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, TrendingUp, Loader2, X } from 'lucide-react';
import { CVData } from '../types';
import { ATSOptimizerService } from '../services/atsOptimizer';
import { DocumentParserService } from '../services/documentParser';
import { AppError, handleError, logError } from '../utils/errorHandler';

interface CVAnalyzerProps {
  onCVAnalyzed: (cvData: CVData) => void;
}

const CVAnalyzer: React.FC<CVAnalyzerProps> = ({ onCVAnalyzed }) => {
  const [cvData, setCVData] = useState<CVData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setError(null);
    setUploadProgress(0);

    this.processFile(file);
  };

  const processFile = async (file: File) => {
    try {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new AppError('File size too large. Maximum 10MB allowed.', 400);
      }

      setUploadProgress(25);

      // Parse document content
      const content = await DocumentParserService.parseDocument(file);
      setUploadProgress(50);

      // Validate content
      DocumentParserService.validateDocumentContent(content);
      setUploadProgress(75);

      // Analyze CV with ATS optimizer
      const analyzedCV = await ATSOptimizerService.analyzeCV(content);
      setUploadProgress(100);

      // Extract contact info and merge with analysis
      const contactInfo = DocumentParserService.extractContactInfo(content);
      const enhancedCV = {
        ...analyzedCV,
        fileName: file.name,
        contactInfo
      };

      setCVData(enhancedCV);
      onCVAnalyzed(enhancedCV);
    } catch (err) {
      const appError = handleError(err);
      setError(appError.message);
      logError(appError, { fileName: file.name, fileSize: file.size });
    } finally {
      setAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const handleReset = () => {
    setCVData(null);
    setError(null);
    setAnalyzing(false);
    setUploadProgress(0);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">CV Analysis & ATS Optimization</h2>
        {cvData && (
          <button
            onClick={handleReset}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}
      
      {!cvData && !analyzing && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload your CV</h3>
          <p className="text-gray-500 mb-4">Supported formats: PDF, DOC, DOCX</p>
          <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Choose File</span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      )}

      {analyzing && (
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
          <Loader2 className="mx-auto h-12 w-12 text-blue-600 mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing your CV</h3>
          <p className="text-gray-500 mb-4">This may take a few moments...</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{uploadProgress}% complete</p>
        </div>
      )}

      {cvData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-3xl font-bold ${getScoreColor(cvData.atsScore)}`}>
                {cvData.atsScore}%
              </div>
              <div className="text-sm text-gray-600 mt-1">
                ATS Score
                {cvData.atsScore >= 80 && <span className="block text-green-600">Excellent</span>}
                {cvData.atsScore >= 60 && cvData.atsScore < 80 && <span className="block text-yellow-600">Good</span>}
                {cvData.atsScore < 60 && <span className="block text-red-600">Needs Work</span>}
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {cvData.keywords.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Keywords Found</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {cvData.suggestions.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Suggestions
                {cvData.suggestions.length === 0 && <span className="block text-green-600">Perfect!</span>}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold mb-3 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Detected Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {cvData.keywords.map((keyword, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold mb-3 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Optimization Suggestions
            </h3>
            {cvData.suggestions.length > 0 ? (
              <div className="space-y-2">
                {cvData.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-yellow-800">{suggestion}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-800">Your CV is well optimized for ATS systems!</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Upload Different CV
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVAnalyzer;