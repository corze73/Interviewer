import { useState, useRef, useCallback } from 'react';
import { useInterviewStore } from '../store/interview';

interface UseMicrophoneReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  error: string | null;
  audioLevel: number;
  requestMicrophonePermission: () => Promise<boolean>;
}

export function useMicrophone(): UseMicrophoneReturn {
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const { isRecording, setRecording, addTranscript } = useInterviewStore();

  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      // Check if we're in a secure context (HTTPS or localhost)
      if (!window.isSecureContext) {
        throw new Error('Microphone access requires HTTPS or localhost. Please use a secure connection.');
      }

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support microphone access. Please use a modern browser like Chrome, Firefox, or Safari.');
      }

      // Check permissions first without requesting media
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permission.state === 'denied') {
          throw new Error('Microphone access is permanently denied. Please reset permissions in your browser settings.');
        }
      }

      // Test microphone access with minimal constraints first
      const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      testStream.getTracks().forEach(track => track.stop()); // Clean up test stream
      
      return true;
    } catch (err) {
      console.error('Permission check failed:', err);
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // First check if we can access microphone
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        throw new Error('Microphone permission check failed. Please allow microphone access and try again.');
      }
      
      // Request microphone access with better error handling
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
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
      let errorMessage = 'Failed to start recording';
      
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
            errorMessage = 'Microphone access denied. Please click the microphone icon in your browser\'s address bar and allow access, then try again.';
            break;
          case 'NotFoundError':
            errorMessage = 'No microphone found. Please connect a microphone and try again.';
            break;
          case 'NotReadableError':
            errorMessage = 'Microphone is already in use by another application. Please close other apps using the microphone and try again.';
            break;
          case 'OverconstrainedError':
            errorMessage = 'Microphone constraints could not be satisfied. Please try again.';
            break;
          case 'SecurityError':
            errorMessage = 'Microphone access blocked due to security restrictions. Please use HTTPS or localhost.';
            break;
          default:
            errorMessage = `Microphone error: ${err.message}`;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
    audioLevel,
    requestMicrophonePermission
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