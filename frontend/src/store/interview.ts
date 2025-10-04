import { create } from 'zustand';

interface InterviewState {
  sessionId: string | null;
  isConnected: boolean;
  isRecording: boolean;
  currentQuestion: string | null;
  transcript: string[];
  aiResponses: string[];
  setSessionId: (sessionId: string | null) => void;
  setConnected: (connected: boolean) => void;
  setRecording: (recording: boolean) => void;
  setCurrentQuestion: (question: string | null) => void;
  addTranscript: (text: string) => void;
  addAIResponse: (response: string) => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  sessionId: null,
  isConnected: false,
  isRecording: false,
  currentQuestion: null,
  transcript: [],
  aiResponses: [],
  
  setSessionId: (sessionId) => set({ sessionId }),
  setConnected: (isConnected) => set({ isConnected }),
  setRecording: (isRecording) => set({ isRecording }),
  setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
  
  addTranscript: (text) => set((state) => ({
    transcript: [...state.transcript, text]
  })),
  
  addAIResponse: (response) => set((state) => ({
    aiResponses: [...state.aiResponses, response]
  })),
  
  reset: () => set({
    sessionId: null,
    isConnected: false,
    isRecording: false,
    currentQuestion: null,
    transcript: [],
    aiResponses: []
  })
}));