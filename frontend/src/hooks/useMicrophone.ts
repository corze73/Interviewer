import { useState, useRef, useCallback } from 'react';
import { useInterviewStore } from '../store/interview';

interface UseMicrophoneReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  error: string | null;
  audioLevel: number;
}

export function useMicrophone(): UseMicrophoneReturn {
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const { isRecording, setRecording, addTranscript } = useInterviewStore();

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      // Set up audio context for level monitoring
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Start audio level monitoring
      const monitorAudioLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255); // Normalize to 0-1
        }
        animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
      };
      monitorAudioLevel();

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        
        // For now, simulate speech-to-text with a mock transcription
        // In a real app, you'd send this to a speech-to-text service
        const mockTranscription = await simulateSpeechToText(audioBlob);
        addTranscript(mockTranscription);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setAudioLevel(0);
      };

      // Start recording
      mediaRecorder.start();
      setRecording(true);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  }, [setRecording, addTranscript]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, [setRecording]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    error,
    audioLevel
  };
}

// Mock speech-to-text function
// In a real app, you'd use services like:
// - Web Speech API (browser-based)
// - Google Cloud Speech-to-Text
// - OpenAI Whisper
// - Azure Cognitive Services
async function simulateSpeechToText(_audioBlob: Blob): Promise<string> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock responses based on common interview scenarios
  const mockResponses = [
    "Hello, I'm excited to be here for this interview. I have over 5 years of experience in software development, particularly with React and Node.js.",
    "I'm passionate about creating user-friendly applications and solving complex technical challenges. In my previous role, I led a team of 3 developers.",
    "I chose to apply for this position because I'm really interested in working with cutting-edge technologies and contributing to innovative projects.",
    "One of my biggest achievements was optimizing our application's performance, which resulted in a 40% improvement in load times.",
    "I believe my experience with TypeScript, GraphQL, and cloud technologies makes me a good fit for this role.",
    "I'm always eager to learn new technologies and I enjoy collaborating with cross-functional teams to deliver high-quality solutions."
  ];
  
  return mockResponses[Math.floor(Math.random() * mockResponses.length)];
}