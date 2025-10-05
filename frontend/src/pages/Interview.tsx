import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useInterviewStore } from '../store/interview';

interface JobData {
  jobTitle: string;
  company: string;
  jobDescription: string;
  skills: string[];
}

export function Interview() {
  const { sessionId: urlSessionId } = useParams<{ sessionId: string }>();
  const { 
    isConnected, 
    isRecording, 
    currentQuestion, 
    transcript, 
    setRecording 
  } = useInterviewStore();

  const [isLoading, setIsLoading] = useState(true);
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);

  useEffect(() => {
    // Load job data from localStorage
    if (urlSessionId) {
      const storedJobData = localStorage.getItem(`interview-${urlSessionId}`);
      if (storedJobData) {
        try {
          const parsedJobData = JSON.parse(storedJobData);
          setJobData(parsedJobData);
        } catch (error) {
          console.error('Failed to parse job data:', error);
        }
      }
    }

    // Simulate connection and interview initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsInterviewStarted(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [urlSessionId]);

  const toggleRecording = () => {
    setRecording(!isRecording);
  };

  const startInterview = () => {
    if (jobData && !currentQuestion) {
      // Generate a job-specific opening question
      const openingQuestion = `Hi! I'm excited to interview you for the ${jobData.jobTitle} position${jobData.company ? ` at ${jobData.company}` : ''}. Let's start with a simple question: Can you tell me about yourself and why you're interested in this role?`;
      
      // In a real app, this would be handled by the interview store
      // For now, we'll just show that the interview is ready to start
      console.log('Starting interview with question:', openingQuestion);
    }
  };

  // Auto-start interview when job data is loaded and interview is initialized
  useEffect(() => {
    if (jobData && isInterviewStarted && !currentQuestion) {
      const timer = setTimeout(() => {
        startInterview();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [jobData, isInterviewStarted, currentQuestion]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading job context and initializing AI interviewer...</p>
          {jobData && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg max-w-md">
              <p className="text-sm text-gray-600">Preparing interview for:</p>
              <p className="font-semibold text-gray-800">{jobData.jobTitle}</p>
              {jobData.company && <p className="text-sm text-gray-600">at {jobData.company}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Handle case where user accessed interview directly without job setup
  if (!jobData && isInterviewStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Job Setup Required</h1>
          <p className="text-gray-600 mb-6">
            To start an interview, you need to set up your job details first. This helps our AI provide relevant questions.
          </p>
          <button
            onClick={() => window.location.href = '/setup'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Go to Job Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen">
          
          {/* Avatar Video Section */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg aspect-video flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">🤖</span>
                </div>
                <p className="text-gray-300">AI Interviewer Avatar</p>
                <p className="text-sm text-gray-500">
                  {!isInterviewStarted ? 'Initializing...' : 
                   !jobData ? 'Loading job context...' :
                   isConnected ? 'Ready to interview' : 'Connecting...'}
                </p>
                {jobData && isInterviewStarted && (
                  <p className="text-xs text-green-400 mt-1">
                    ✅ Ready for {jobData.jobTitle} interview
                  </p>
                )}
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={toggleRecording}
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
              </button>
            </div>
          </div>

          {/* Chat/Transcript Section */}
          <div className="bg-gray-800 rounded-lg p-6 flex flex-col">
            <h2 className="text-xl font-bold mb-4">Interview Transcript</h2>
            
            {currentQuestion && (
              <div className="mb-4 p-3 bg-blue-900/50 rounded-lg">
                <p className="text-sm text-blue-300">Current Question:</p>
                <p className="text-white">{currentQuestion}</p>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {transcript.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  {!isInterviewStarted ? (
                    <p>Initializing interview session...</p>
                  ) : !jobData ? (
                    <p>Loading job context...</p>
                  ) : (
                    <div>
                      <p className="text-green-400 mb-2">🎤 Interview Ready!</p>
                      <p className="text-sm">Click "Start Recording" to begin your {jobData.jobTitle} interview.</p>
                      {jobData.company && (
                        <p className="text-xs text-gray-400 mt-1">Position at {jobData.company}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                transcript.map((text, index) => (
                  <div key={index} className="p-3 bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-300">You:</p>
                    <p className="text-white">{text}</p>
                  </div>
                ))
              )}
            </div>
            
            {/* Job Context */}
            {jobData && (
              <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-300 mb-2">Interview Context:</p>
                <p className="text-white font-semibold">{jobData.jobTitle}</p>
                {jobData.company && <p className="text-gray-300 text-sm">{jobData.company}</p>}
                {jobData.skills.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-1">Key Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {jobData.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Session Info */}
            <div className="text-sm text-gray-400 border-t border-gray-700 pt-4">
              <p>Session ID: {urlSessionId || 'Not connected'}</p>
              <p>Status: {isRecording ? 'Recording' : 'Idle'}</p>
              <p>Transcript Length: {transcript.length} messages</p>
              <p>Interview Status: {isInterviewStarted ? 'Ready' : 'Initializing'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}