import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useInterviewStore } from '../store/interview';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
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

  // Initialize speech recognition and AI interviewer hooks
  const { 
    isListening: isRecording, 
    startListening: startRecording, 
    stopListening: stopRecording, 
    error: micError,
    transcript: liveTranscript,
    confidence,
    isSupported: speechSupported
  } = useSpeechRecognition();
  
  const { 
    startInterview: initializeInterview, 
    processUserResponse,
    isSpeaking: aiIsSpeaking
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

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
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
                {aiIsSpeaking && (
                  <div className="mt-2">
                    <div className="flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-xs text-blue-400">AI Speaking...</span>
                    </div>
                  </div>
                )}
                {isRecording && (
                  <div className="mt-2">
                    <div className="flex items-center justify-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-xs text-red-400">Listening...</span>
                    </div>
                    {liveTranscript && (
                      <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-300 max-w-xs">
                        <p className="text-blue-400 mb-1">Live: </p>
                        <p>"{liveTranscript}"</p>
                        {confidence > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Confidence: {Math.round(confidence * 100)}%
                          </p>
                        )}
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
                disabled={!jobData || !isInterviewStarted || !speechSupported}
                className={`px-6 py-3 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isRecording ? '⏹️ Stop Listening' : '🎤 Start Speaking'}
              </button>
              {!speechSupported && (
                <p className="text-xs text-yellow-400 mt-2">
                  Speech recognition not supported. Please use Chrome, Edge, or Safari.
                </p>
              )}
            </div>
            
            {/* Error Display */}
            {micError && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-center">
                <p className="text-red-300 text-sm">⚠️ Microphone Error</p>
                <p className="text-red-400 text-xs mt-1">{micError}</p>
                <div className="mt-3 space-y-2">
                  <p className="text-gray-400 text-xs">
                    To fix this issue:
                  </p>
                  <div className="text-xs text-gray-400 text-left space-y-2">
                    <div>
                      <p className="font-semibold text-gray-300">Chrome/Edge:</p>
                      <ul className="ml-2 space-y-1">
                        <li>• Click the camera/microphone icon in the address bar</li>
                        <li>• Select "Always allow" for microphone</li>
                        <li>• Click "Done" and refresh the page</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-300">Firefox:</p>
                      <ul className="ml-2 space-y-1">
                        <li>• Click the microphone icon in the address bar</li>
                        <li>• Remove the block and select "Allow"</li>
                        <li>• Refresh the page</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-300">Safari:</p>
                      <ul className="ml-2 space-y-1">
                        <li>• Go to Safari → Settings → Websites → Microphone</li>
                        <li>• Set this site to "Allow"</li>
                        <li>• Refresh the page</li>
                      </ul>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        // Try to start listening to trigger permission request
                        startRecording();
                        setTimeout(() => {
                          if (!speechSupported) {
                            alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
                          }
                        }, 1000);
                      } catch (err) {
                        console.error('Permission request failed:', err);
                        alert('Failed to request permissions. Please check your browser settings.');
                      }
                    }}
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                  >
                    Request Microphone Access
                  </button>
                </div>
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
                  {/* Show conversation history - interleaved AI questions and user responses */}
                  {aiResponses.map((response, index) => (
                    <div key={`conversation-${index}`} className="space-y-2">
                      {/* AI Question */}
                      <div className="p-3 bg-blue-900/50 rounded-lg">
                        <p className="text-sm text-blue-300">AI Interviewer:</p>
                        <p className="text-white">{response}</p>
                      </div>
                      
                      {/* User Response (if available) */}
                      {transcript[index] && (
                        <div className="p-3 bg-green-900/30 rounded-lg">
                          <p className="text-sm text-green-300">You:</p>
                          <p className="text-white">{transcript[index]}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Show any remaining user responses that don't have AI follow-ups yet */}
                  {transcript.slice(aiResponses.length).map((userResponse, index) => (
                    <div key={`user-extra-${index}`} className="p-3 bg-green-900/30 rounded-lg">
                      <p className="text-sm text-green-300">You:</p>
                      <p className="text-white">{userResponse}</p>
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
              
              {/* Debug info - remove this in production */}
              {(transcript.length > 0 || liveTranscript) && (
                <div className="mt-4 p-2 bg-gray-700/50 rounded text-xs">
                  <p className="text-gray-400">Debug - Transcript Count: {transcript.length}</p>
                  {liveTranscript && (
                    <p className="text-gray-400">Live: "{liveTranscript}" (confidence: {Math.round(confidence * 100)}%)</p>
                  )}
                  {transcript.length > 0 && (
                    <div className="text-gray-400">
                      <p>Stored responses:</p>
                      {transcript.map((item, idx) => (
                        <p key={idx} className="ml-2">• {item}</p>
                      ))}
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