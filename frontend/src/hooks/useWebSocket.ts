import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useInterviewStore } from '../store/interview';

export function useWebSocketConnection() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { setConnected, setSessionId } = useInterviewStore();

  useEffect(() => {
    // Connect to backend WebSocket
    const newSocket = io('http://localhost:3001', {
      auth: {
        token: 'development-token' // TODO: Replace with real auth
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      setConnected(true);
      setSessionId(newSocket.id || null);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setConnected(false);
      setSessionId(null);
    });

    newSocket.on('ai_response', (data) => {
      console.log('AI Response:', data);
      // Handle AI responses
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [setConnected, setSessionId]);

  return socket;
}