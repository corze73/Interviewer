import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { getDatabase } from './lib/database';
import { interviewSessions, users } from './lib/schema';
import { eq, desc } from 'drizzle-orm';

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
        // Get all interview sessions
        const sessions = await db
          .select({
            id: interviewSessions.id,
            userId: interviewSessions.userId,
            jobTitle: interviewSessions.jobTitle,
            jobCompany: interviewSessions.jobCompany,
            status: interviewSessions.status,
            startedAt: interviewSessions.startedAt,
            completedAt: interviewSessions.completedAt,
            createdAt: interviewSessions.createdAt,
          })
          .from(interviewSessions)
          .orderBy(desc(interviewSessions.createdAt))
          .limit(50); // Limit for performance

        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessions,
            count: sessions.length,
          }),
        };

      case 'POST':
        // Create a new interview session
        const requestBody = JSON.parse(event.body || '{}');
        const { userId, jobTitle, jobCompany, jobDescription, jobAnalysis } = requestBody;

        if (!jobTitle || !jobDescription || !jobAnalysis) {
          return {
            statusCode: 400,
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              error: 'Missing required fields',
              message: 'jobTitle, jobDescription, and jobAnalysis are required',
            }),
          };
        }

        const newSession = await db.insert(interviewSessions).values({
          userId: userId || null,
          jobTitle,
          jobCompany: jobCompany || null,
          jobDescription,
          jobAnalysis,
          status: 'created',
        }).returning({
          id: interviewSessions.id,
          userId: interviewSessions.userId,
          jobTitle: interviewSessions.jobTitle,
          jobCompany: interviewSessions.jobCompany,
          status: interviewSessions.status,
          createdAt: interviewSessions.createdAt,
        });

        return {
          statusCode: 201,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session: newSession[0],
            message: 'Interview session created successfully',
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
    console.error('Sessions API error:', error);
    
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process session request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};