import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home } from './pages/Home';
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
      
      <AnimatePresence mode="wait">
        <Routes>
          <Route 
            path="/" 
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Home />
              </motion.div>
            } 
          />
          <Route 
            path="/interview/:sessionId" 
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Interview />
              </motion.div>
            } 
          />
          <Route 
            path="/report/:sessionId" 
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Report />
              </motion.div>
            } 
          />
          <Route 
            path="*" 
            element={<NotFound />} 
          />
        </Routes>
      </AnimatePresence>
      </div>
    </BrowserRouter>
  );
}

export default App;