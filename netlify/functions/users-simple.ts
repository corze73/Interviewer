import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

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
    switch (event.httpMethod) {
      case 'GET':
        // Mock users data for now
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            users: [
              {
                id: '1',
                name: 'Demo User',
                email: 'demo@example.com',
                createdAt: new Date().toISOString(),
              }
            ],
            count: 1,
            message: 'Mock data - database connection pending',
          }),
        };

      case 'POST':
        const requestBody = JSON.parse(event.body || '{}');
        const { email, name } = requestBody;

        if (!email || !name) {
          return {
            statusCode: 400,
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              error: 'Missing required fields',
              message: 'Email and name are required',
            }),
          };
        }

        // Mock user creation
        return {
          statusCode: 201,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: {
              id: Date.now().toString(),
              email,
              name,
              createdAt: new Date().toISOString(),
            },
            message: 'Mock user created - database connection pending',
          }),
        };

      default:
        return {
          statusCode: 405,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: 'Method not allowed',
            message: `HTTP method ${event.httpMethod} is not supported`,
          }),
        };
    }
  } catch (error) {
    console.error('Users API error:', error);
    
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process user request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};