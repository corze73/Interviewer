import { useState, useEffect } from 'react';
import { useInterviewStore } from '../store/interview';

export function Interview() {
  const { 
    sessionId, 
    isConnected, 
    isRecording, 
    currentQuestion, 
    transcript, 
    setRecording 
  } = useInterviewStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggleRecording = () => {
    setRecording(!isRecording);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Initializing interview session...</p>
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
                  {isConnected ? 'Connected' : 'Connecting...'}
                </p>
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
                  <p>No transcript yet.</p>
                  <p className="text-sm">Start recording to begin the interview.</p>
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
            
            {/* Session Info */}
            <div className="text-sm text-gray-400 border-t border-gray-700 pt-4">
              <p>Session ID: {sessionId || 'Not connected'}</p>
              <p>Status: {isRecording ? 'Recording' : 'Idle'}</p>
              <p>Transcript Length: {transcript.length} messages</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}