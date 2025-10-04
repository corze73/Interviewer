import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { getDatabase } from './lib/database';
import { users } from '../../backend/src/database/schema';
import { eq } from 'drizzle-orm';

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
    const db = await getDatabase();
    
    switch (event.httpMethod) {
      case 'GET':
        // Get all users (in production, add pagination and auth)
        const allUsers = await db.select({
          id: users.id,
          email: users.email,
          name: users.name,
          emailVerified: users.emailVerified,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        }).from(users);

        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            users: allUsers,
            count: allUsers.length,
          }),
        };

      case 'POST':
        // Create a new user
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

        const newUser = await db.insert(users).values({
          email,
          name,
          emailVerified: false,
        }).returning({
          id: users.id,
          email: users.email,
          name: users.name,
          emailVerified: users.emailVerified,
          createdAt: users.createdAt,
        });

        return {
          statusCode: 201,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: newUser[0],
            message: 'User created successfully',
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
    console.error('User API error:', error);
    
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