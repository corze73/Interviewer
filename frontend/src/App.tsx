import { BrowserRouter, Routes, Route } from 'react-router-dom';import { BrowserRouter, Routes, Route } from 'react-router-dom';import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Home } from './pages/Home';

import { Interview } from './pages/Interview';import { Home } from './pages/Home';

import { Report } from './pages/Report';

import { NotFound } from './pages/NotFound';import { Interview } from './pages/Interview';// Simple test components

import { Navigation } from './components/Navigation';

import { useInterviewStore } from './store/interview';import { Report } from './pages/Report';function SimpleHome() {



function App() {import { NotFound } from './pages/NotFound';  return (

  const { isRecording } = useInterviewStore();

import { Navigation } from './components/Navigation';    <div style={{ padding: '20px', textAlign: 'center' }}>

  return (

    <BrowserRouter>import { useInterviewStore } from './store/interview';      <h1 style={{ color: 'black', fontSize: '32px' }}>🎯 AI Interviewer</h1>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

        {!isRecording && <Navigation />}      <p style={{ color: 'gray', fontSize: '18px', margin: '20px 0' }}>

        <Routes>

          <Route path="/" element={<Home />} />function App() {        Welcome to the Full-Realism Human-AI Interviewer

          <Route path="/interview/:sessionId" element={<Interview />} />

          <Route path="/report/:sessionId" element={<Report />} />  const { isRecording } = useInterviewStore();      </p>

          <Route path="*" element={<NotFound />} />

        </Routes>      <button style={{ 

      </div>

    </BrowserRouter>  return (        backgroundColor: '#3b82f6', 

  );

}    <BrowserRouter>        color: 'white', 



export default App;      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">        padding: '12px 24px', 

        {!isRecording && <Navigation />}        border: 'none', 

        <Routes>        borderRadius: '8px',

          <Route path="/" element={<Home />} />        fontSize: '16px',

          <Route path="/interview/:sessionId" element={<Interview />} />        cursor: 'pointer'

          <Route path="/report/:sessionId" element={<Report />} />      }}>

          <Route path="*" element={<NotFound />} />        Start Interview

        </Routes>      </button>

      </div>    </div>

    </BrowserRouter>  );

  );}

}

function SimpleNotFound() {

export default App;  return (
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