export function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">AI Interviewer</h1>
      <div className="text-center">
        <p className="text-lg text-gray-600 mb-8">
          Welcome to the Full-Realism Human-AI Interviewer. Start your interview experience with our advanced AI avatar.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">
          Start Interview
        </button>
      </div>
    </div>
  );
}