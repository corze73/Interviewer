import { useState, useCallback, useRef, useEffect } from 'react';

interface UseTextToSpeechReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
  volume: number;
  setVolume: (volume: number) => void;
  rate: number;
  setRate: (rate: number) => void;
  pitch: number;
  setPitch: (pitch: number) => void;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [volume, setVolume] = useState(0.8);
  const [rate, setRate] = useState(0.9); // Slightly slower for interview context
  const [pitch, setPitch] = useState(1.0);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const isSupported = 'speechSynthesis' in window;

  // Load available voices
  const loadVoices = useCallback(() => {
    if (!isSupported) return;
    
    const availableVoices = speechSynthesis.getVoices();
    setVoices(availableVoices);
    
    // Auto-select a good default voice (prefer English, neutral gender)
    if (!selectedVoice && availableVoices.length > 0) {
      // Look for high-quality English voices
      const preferredVoice = availableVoices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.includes('Premium') || 
         voice.name.includes('Neural') || 
         voice.name.includes('Enhanced') ||
         voice.name.includes('Google') ||
         voice.name.includes('Microsoft'))
      ) || availableVoices.find(voice => voice.lang.startsWith('en')) || availableVoices[0];
      
      setSelectedVoice(preferredVoice);
    }
  }, [isSupported, selectedVoice]);

  // Initialize voices when component mounts and when voices change
  useEffect(() => {
    if (!isSupported) return;
    
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, [loadVoices, isSupported]);

  const speak = useCallback(async (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!isSupported) {
        reject(new Error('Text-to-speech is not supported in this browser'));
        return;
      }

      // Stop any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      
      // Configure voice settings
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.volume = volume;
      utterance.rate = rate;
      utterance.pitch = pitch;
      
      // Set up event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
        resolve();
      };
      
      utterance.onerror = (event) => {
        setIsSpeaking(false);
        utteranceRef.current = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };
      
      // Start speaking
      speechSynthesis.speak(utterance);
    });
  }, [isSupported, selectedVoice, volume, rate, pitch]);

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
    }
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices,
    selectedVoice,
    setSelectedVoice,
    volume,
    setVolume,
    rate,
    setRate,
    pitch,
    setPitch
  };
}

