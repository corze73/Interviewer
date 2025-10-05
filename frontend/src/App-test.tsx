import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Simple test components
function SimpleHome() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: 'black', fontSize: '32px' }}>🎯 AI Interviewer</h1>
      <p style={{ color: 'gray', fontSize: '18px', margin: '20px 0' }}>
        Welcome to the Full-Realism Human-AI Interviewer
      </p>
      <button style={{ 
        backgroundColor: '#3b82f6', 
        color: 'white', 
        padding: '12px 24px', 
        border: 'none', 
        borderRadius: '8px',
        fontSize: '16px',
        cursor: 'pointer'
      }}>
        Start Interview
      </button>
    </div>
  );
}

function SimpleNotFound() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: 'red' }}>404 - Page Not Found</h1>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Routes>
          <Route path="/" element={<SimpleHome />} />
          <Route path="*" element={<SimpleNotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;