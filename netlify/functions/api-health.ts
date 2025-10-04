import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { getDatabase } from './lib/database';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Test database connection
    await getDatabase();

    // Health check endpoint
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'AI Interviewer API is running on Netlify Functions',
        database: 'connected',
      }),
    };
  } catch (error) {
    console.error('Health check failed:', error);
    
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};