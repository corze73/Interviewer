import { useNavigate } from 'react-router-dom';

export function Home() {
  const navigate = useNavigate();

  const handleStartInterview = () => {
    // Generate a new session ID
    const sessionId = Date.now().toString();
    navigate(`/interview/${sessionId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">AI Interviewer</h1>
      <div className="text-center">
        <p className="text-lg text-gray-600 mb-8">
          Welcome to the Full-Realism Human-AI Interviewer. Start your interview experience with our advanced AI avatar.
        </p>
        <button 
          onClick={handleStartInterview}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Start Interview
        </button>
      </div>
    </div>
  );
}