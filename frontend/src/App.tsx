import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { JobSetup } from './pages/JobSetup';
import { Interview } from './pages/Interview';
import { Report } from './pages/Report';
import { NotFound } from './pages/NotFound';
import { Navigation } from './components/Navigation';
import { useInterviewStore } from './store/interview';

function App() {
  const { isRecording } = useInterviewStore();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {!isRecording && <Navigation />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/setup" element={<JobSetup />} />
          <Route path="/interview/:sessionId" element={<Interview />} />
          <Route path="/report/:sessionId" element={<Report />} />
          {/* Demo routes for navigation */}
          <Route path="/interview" element={<Interview />} />
          <Route path="/report" element={<Report />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
