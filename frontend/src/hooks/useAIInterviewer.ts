import { useCallback } from 'react';
import { useInterviewStore } from '../store/interview';
import { useTextToSpeech } from './useTextToSpeech';

interface JobData {
  jobTitle: string;
  company: string;
  jobDescription: string;
  skills: string[];
}

export function useAIInterviewer(jobData: JobData | null) {
  const { 
    currentQuestion, 
    setCurrentQuestion, 
    addAIResponse
  } = useInterviewStore();
  
  const { speak, isSpeaking } = useTextToSpeech();

  const generateInitialQuestion = useCallback(() => {
    if (!jobData) return;

    const initialQuestions = [
      `Hi! I'm excited to interview you for the ${jobData.jobTitle} position${jobData.company ? ` at ${jobData.company}` : ''}. Let's start with a simple question: Can you tell me about yourself and why you're interested in this role?`,
      `Welcome! I see you're applying for the ${jobData.jobTitle} position. To get started, could you walk me through your background and what drew you to this opportunity?`,
      `Hello! Thanks for taking the time to interview with us today. For the ${jobData.jobTitle} role, I'd love to hear about your experience and what makes you excited about this position.`
    ];

    const question = initialQuestions[Math.floor(Math.random() * initialQuestions.length)];
    setCurrentQuestion(question);
    addAIResponse(question);
    
    // Speak the question
    setTimeout(() => {
      speak(question).catch(console.error);
    }, 500); // Small delay to ensure UI is updated
  }, [jobData, setCurrentQuestion, addAIResponse]);

  const generateFollowUpQuestion = useCallback((userResponse: string) => {
    if (!jobData) return;

    // Analyze the user's response and generate relevant follow-up questions
    const followUpQuestions = generateContextualQuestions(userResponse, jobData);
    const question = followUpQuestions[Math.floor(Math.random() * followUpQuestions.length)];
    
    setCurrentQuestion(question);
    addAIResponse(question);
    
    // Speak the follow-up question
    setTimeout(() => {
      speak(question).catch(console.error);
    }, 500);
  }, [jobData, setCurrentQuestion, addAIResponse]);

  const startInterview = useCallback(() => {
    if (!currentQuestion && jobData) {
      // Add a small delay to make it feel more natural
      setTimeout(() => {
        generateInitialQuestion();
      }, 1500);
    }
  }, [currentQuestion, jobData, generateInitialQuestion]);

  const processUserResponse = useCallback((response: string) => {
    // Simulate AI processing delay
    setTimeout(() => {
      generateFollowUpQuestion(response);
    }, 2000 + Math.random() * 1000); // 2-3 second delay
  }, [generateFollowUpQuestion]);

  return {
    startInterview,
    processUserResponse,
    currentQuestion,
    isSpeaking
  };
}

function generateContextualQuestions(userResponse: string, jobData: JobData): string[] {
  const response = userResponse.toLowerCase();
  
  // Technical questions based on job skills
  const technicalQuestions = jobData.skills.flatMap(skill => [
    `I noticed you mentioned experience with ${skill}. Can you describe a specific project where you used ${skill} and what challenges you faced?`,
    `How do you stay current with ${skill} best practices and new developments?`,
    `Can you walk me through your process when working with ${skill}?`
  ]);

  // Behavioral questions
  const behavioralQuestions = [
    "Tell me about a time when you had to learn a new technology quickly. How did you approach it?",
    "Describe a challenging project you worked on. What made it difficult and how did you overcome those challenges?",
    "How do you handle disagreements with team members or stakeholders?",
    "Tell me about a time when you had to prioritize multiple tasks with tight deadlines.",
    "Describe your approach to code reviews and collaboration with other developers."
  ];

  // Experience-based questions
  const experienceQuestions = [
    `Based on your background, how do you think your experience aligns with what we're looking for in this ${jobData.jobTitle} role?`,
    "What has been your most rewarding project so far in your career?",
    "How do you approach debugging complex issues?",
    "Tell me about a time when you had to make a technical decision with limited information."
  ];

  // Company/role specific questions
  const roleQuestions = [
    `What excites you most about working as a ${jobData.jobTitle}?`,
    `How do you see yourself contributing to our team in the first 90 days?`,
    "What questions do you have about our company culture or this role?",
    "Where do you see your career heading in the next few years?"
  ];

  // Combine all questions and filter based on context
  let allQuestions = [...technicalQuestions, ...behavioralQuestions, ...experienceQuestions, ...roleQuestions];

  // Simple keyword-based filtering for more relevant questions
  if (response.includes('experience') || response.includes('worked')) {
    allQuestions = [...experienceQuestions, ...technicalQuestions, ...behavioralQuestions];
  } else if (response.includes('excited') || response.includes('interested')) {
    allQuestions = [...roleQuestions, ...behavioralQuestions];
  } else if (jobData.skills.some(skill => response.includes(skill.toLowerCase()))) {
    allQuestions = [...technicalQuestions, ...experienceQuestions];
  }

  return allQuestions.slice(0, 5); // Return top 5 most relevant questions
}