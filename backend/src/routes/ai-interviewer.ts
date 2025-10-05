import { Router } from 'express';
import { aiInterviewerService, InterviewContext } from '../services/ai-interviewer';
import { z } from 'zod';

const router = Router();

// Validation schemas
const GenerateQuestionSchema = z.object({
  jobTitle: z.string().min(1),
  company: z.string().optional(),
  jobDescription: z.string().optional(),
  skills: z.array(z.string()),
  candidateResponses: z.array(z.string()).default([]),
  currentQuestionNumber: z.number().default(0),
  userResponse: z.string().optional(),
});

// Generate initial question
router.post('/generate-initial-question', async (req, res) => {
  try {
    const data = GenerateQuestionSchema.parse(req.body);
    
    const context: InterviewContext = {
      jobTitle: data.jobTitle,
      company: data.company,
      jobDescription: data.jobDescription,
      skills: data.skills,
      candidateResponses: data.candidateResponses,
      currentQuestionNumber: data.currentQuestionNumber,
    };

    const question = await aiInterviewerService.generateInitialQuestion(context);
    
    res.json({ 
      success: true, 
      question,
      questionNumber: 1
    });
  } catch (error) {
    console.error('Error generating initial question:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate initial question',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate follow-up question
router.post('/generate-followup-question', async (req, res) => {
  try {
    const data = GenerateQuestionSchema.parse(req.body);
    
    if (!data.userResponse) {
      return res.status(400).json({
        success: false,
        error: 'User response is required for follow-up questions'
      });
    }

    const context: InterviewContext = {
      jobTitle: data.jobTitle,
      company: data.company,
      jobDescription: data.jobDescription,
      skills: data.skills,
      candidateResponses: [...data.candidateResponses, data.userResponse],
      currentQuestionNumber: data.currentQuestionNumber + 1,
    };

    const question = await aiInterviewerService.generateFollowUpQuestion(context, data.userResponse);
    
    res.json({ 
      success: true, 
      question,
      questionNumber: context.currentQuestionNumber
    });
  } catch (error) {
    console.error('Error generating follow-up question:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate follow-up question',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate interview summary
router.post('/generate-summary', async (req, res) => {
  try {
    const data = GenerateQuestionSchema.parse(req.body);
    
    const context: InterviewContext = {
      jobTitle: data.jobTitle,
      company: data.company,
      jobDescription: data.jobDescription,
      skills: data.skills,
      candidateResponses: data.candidateResponses,
      currentQuestionNumber: data.currentQuestionNumber,
    };

    const summary = await aiInterviewerService.generateInterviewSummary(context);
    
    res.json({ 
      success: true, 
      summary
    });
  } catch (error) {
    console.error('Error generating interview summary:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate interview summary',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check for AI service
router.get('/health', async (req, res) => {
  try {
    // Simple test to verify AI service is working
    const testContext: InterviewContext = {
      jobTitle: 'Software Engineer',
      skills: ['JavaScript'],
      candidateResponses: [],
      currentQuestionNumber: 0,
    };
    
    await aiInterviewerService.generateInitialQuestion(testContext);
    
    res.json({ 
      success: true, 
      message: 'AI interviewer service is healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI service health check failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'AI interviewer service is not available',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as aiInterviewerRoutes };