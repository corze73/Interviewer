import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useInterviewStore } from '../store/interview';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAIInterviewer } from '../hooks/useAIInterviewer';
import { InterviewerAvatar } from '../components/InterviewerAvatar';

interface JobData {
  jobTitle: string;
  company: string;
  jobDescription: string;
  skills: string[];
}

export function Interview() {
  const { sessionId: urlSessionId } = useParams<{ sessionId: string }>();
  const { 
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
    isSpeaking: aiIsSpeaking,
    isProcessing: aiIsProcessing
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
      // Trigger response processing when user manually stops recording
      setShouldProcessResponse(true);
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

  // Process user responses only when manually stopped (not automatically)
  const [shouldProcessResponse, setShouldProcessResponse] = useState(false);
  
  useEffect(() => {
    if (shouldProcessResponse && transcript.length > 0) {
      const latestResponse = transcript[transcript.length - 1];
      // Only process if the response has some meaningful content
      if (latestResponse.trim().length > 2) {
        console.log('Processing user response:', latestResponse);
        processUserResponse(latestResponse);
        setShouldProcessResponse(false); // Reset the flag
      }
    }
  }, [transcript, processUserResponse, shouldProcessResponse]);

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
          
          {/* Professional Interviewer Avatar Section */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-8 mb-4 min-h-[500px] flex items-center justify-center">
              <InterviewerAvatar 
                isSpeaking={aiIsSpeaking}
                isListening={isRecording}
                className="w-full"
              />
            </div>
            
            {/* Live Transcript Display */}
            {isRecording && liveTranscript && (
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-green-400 mb-2">🎤 You're speaking:</p>
                  <p className="text-white text-lg italic">"{liveTranscript}"</p>
                  {confidence > 0 && (
                    <p className="text-xs text-gray-400 mt-2">
                      Confidence: {Math.round(confidence * 100)}%
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Controls */}
            <div className="flex flex-col items-center space-y-4">
              {/* Status indicator */}
              <div className="text-center">
                {aiIsSpeaking ? (
                  <div className="text-blue-400 text-sm">
                    <div className="animate-pulse">🗣️ Your interviewer is speaking...</div>
                  </div>
                ) : aiIsProcessing ? (
                  <div className="text-purple-400 text-sm">
                    <div className="animate-pulse">💭 Preparing next question...</div>
                  </div>
                ) : currentQuestion && !isRecording ? (
                  <div className="text-green-400 text-sm">
                    ✅ Your turn to speak
                  </div>
                ) : isRecording ? (
                  <div className="text-red-400 text-sm">
                    <div className="animate-pulse">👂 Listening carefully...</div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">
                    Interview starting soon...
                  </div>
                )}
              </div>

              {/* Recording button */}
              <button
                onClick={toggleRecording}
                disabled={!jobData || !isInterviewStarted || !speechSupported || aiIsSpeaking || aiIsProcessing}
                className={`px-8 py-4 rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30' 
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30'
                } ${isRecording ? 'animate-pulse' : ''}`}
              >
                {isRecording ? '✋ Finished Speaking' : '🗣️ Start My Response'}
              </button>

              {/* Help text */}
              <div className="text-center text-xs text-gray-400 max-w-md">
                {aiIsProcessing ? (
                  <p>Your interviewer is thinking about your response and preparing the next question. Please wait a moment.</p>
                ) : currentQuestion && !aiIsSpeaking ? (
                  <p>Ready to answer? Click the button to start speaking. Click again when you're done with your response.</p>
                ) : aiIsSpeaking ? (
                  <p>Your interviewer is speaking. Please listen and wait for them to finish.</p>
                ) : (
                  <p>Your interview is starting. Your interviewer will ask the first question shortly.</p>
                )}
              </div>

              {!speechSupported && (
                <p className="text-xs text-yellow-400 text-center">
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