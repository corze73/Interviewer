import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useInterviewStore } from '../store/interview';
import { useMicrophone } from '../hooks/useMicrophone';
import { useAIInterviewer } from '../hooks/useAIInterviewer';

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
    currentQuestion, 
    transcript, 
    aiResponses,
    setConnected
  } = useInterviewStore();

  const [isLoading, setIsLoading] = useState(true);
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);

  // Initialize microphone and AI interviewer hooks
  const { 
    isRecording, 
    startRecording, 
    stopRecording, 
    error: micError, 
    audioLevel 
  } = useMicrophone();
  
  const { 
    startInterview: initializeInterview, 
    processUserResponse 
  } = useAIInterviewer(jobData);

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
      setConnected(true); // Set connection status
    }, 3000);
    return () => clearTimeout(timer);
  }, [urlSessionId]);

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  // Auto-start interview when job data is loaded and interview is initialized
  useEffect(() => {
    if (jobData && isInterviewStarted && !currentQuestion) {
      console.log('Initializing interview with job data:', jobData);
      const timer = setTimeout(() => {
        initializeInterview();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [jobData, isInterviewStarted, currentQuestion, initializeInterview]);

  // Force start interview when everything is ready (fallback)
  useEffect(() => {
    if (jobData && isInterviewStarted && !currentQuestion) {
      const timer = setTimeout(() => {
        console.log('Force starting interview - generating first question');
        initializeInterview();
      }, 3000); // Wait 3 seconds as backup
      return () => clearTimeout(timer);
    }
  }, [jobData, isInterviewStarted]);

  // Process user responses when new transcript is added
  useEffect(() => {
    if (transcript.length > 0) {
      const latestResponse = transcript[transcript.length - 1];
      processUserResponse(latestResponse);
    }
  }, [transcript, processUserResponse]);

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
                {isRecording && (
                  <div className="mt-2">
                    <div className="flex items-center justify-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-xs text-red-400">Recording...</span>
                    </div>
                    {audioLevel > 0 && (
                      <div className="mt-1 w-20 h-1 bg-gray-600 rounded mx-auto">
                        <div 
                          className="h-full bg-green-400 rounded transition-all duration-100"
                          style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={toggleRecording}
                disabled={!jobData || !isInterviewStarted}
                className={`px-6 py-3 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
              </button>
            </div>
            
            {/* Error Display */}
            {micError && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-center">
                <p className="text-red-300 text-sm">⚠️ Microphone Error</p>
                <p className="text-red-400 text-xs mt-1">{micError}</p>
                <p className="text-gray-400 text-xs mt-2">
                  Please check your microphone permissions and try again.
                </p>
              </div>
            )}
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
              {aiResponses.length === 0 && transcript.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  {!isInterviewStarted ? (
                    <p>Initializing interview session...</p>
                  ) : !jobData ? (
                    <p>Loading job context...</p>
                  ) : !currentQuestion ? (
                    <div>
                      <p className="text-blue-400 mb-4">🤖 Ready to start your interview!</p>
                      <p className="text-sm mb-4">Click the button below to begin with your first question.</p>
                      <button
                        onClick={initializeInterview}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                        Start Interview
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-green-400 mb-2">🎤 Interview Ready!</p>
                      <p className="text-sm">Click "Start Recording" to respond to the AI interviewer.</p>
                      {jobData.company && (
                        <p className="text-xs text-gray-400 mt-1">Position at {jobData.company}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Show conversation history */}
                  {aiResponses.map((response, index) => (
                    <div key={`ai-${index}`}>
                      {/* AI Question */}
                      <div className="p-3 bg-blue-900/50 rounded-lg">
                        <p className="text-sm text-blue-300">AI Interviewer:</p>
                        <p className="text-white">{response}</p>
                      </div>
                      
                      {/* User Response (if available) */}
                      {transcript[index] && (
                        <div className="p-3 bg-gray-700 rounded-lg mt-2">
                          <p className="text-sm text-gray-300">You:</p>
                          <p className="text-white">{transcript[index]}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Show if AI is thinking */}
                  {transcript.length > aiResponses.length - 1 && (
                    <div className="p-3 bg-purple-900/50 rounded-lg">
                      <p className="text-sm text-purple-300">AI Interviewer:</p>
                      <p className="text-gray-300 italic">
                        <span className="animate-pulse">Thinking about your response...</span>
                      </p>
                    </div>
                  )}
                </div>
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