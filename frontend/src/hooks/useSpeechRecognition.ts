import { useState, useRef, useCallback } from 'react';
import { useInterviewStore } from '../store/interview';

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
  isSupported: boolean;
  confidence: number;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { addTranscript } = useInterviewStore();

  // Check if speech recognition is supported
  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      setError(null);
      setTranscript('');

      // Create new speech recognition instance
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // Configure recognition settings
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      // Event handlers
      recognition.onstart = () => {
        setIsListening(true);
        console.log('Speech recognition started');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptText = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += transcriptText;
            setConfidence(result[0].confidence);
          } else {
            interimTranscript += transcriptText;
          }
        }

        // Update transcript state
        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);

        // Add final transcript to store
        if (finalTranscript.trim()) {
          addTranscript(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = 'Speech recognition failed';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking closer to your microphone.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not accessible. Please check your microphone settings.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
            break;
          case 'network':
            errorMessage = 'Network error during speech recognition. Please check your internet connection.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not allowed. Please use HTTPS.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        setError(errorMessage);
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('Speech recognition ended');
        
        // Clear the current transcript when recognition ends
        // This ensures each response is captured separately
        setTranscript('');
      };

      // Start recognition
      recognition.start();
      recognitionRef.current = recognition;

    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Failed to initialize speech recognition');
      setIsListening(false);
    }
  }, [isSupported, addTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
    isSupported,
    confidence
  };
}

// Extend Window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}