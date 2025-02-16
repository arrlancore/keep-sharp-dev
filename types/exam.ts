export type QuestionType = "single" | "multiple";
export interface Question {
  id: number;
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string[];
  hint: string;
  explanation: string;
}

export interface ExamPractice {
  id: string;
  title: string;
  description: string;
  prerequisites: string[];
  questions: Question[];
}

export interface QuizAttempt {
  examId: string;
  timestamp: string;
  score: number;
  totalQuestions: number;
  hintsUsed: boolean[];
  explanationsUsed: boolean[];
  answers: string[][];
}

// Add new interfaces for time and domain tracking
interface QuestionEnhanced extends Question {
  domainId: string;
  domain: string;
  weight: number; // domain weight in exam
}

interface QuizAttemptEnhanced extends QuizAttempt {
  timeStarted: string;
  timeEnded: string;
  timePerQuestion: number[]; // time spent on each question
  domainScores: {
    domainId: string;
    score: number;
    totalQuestions: number;
  }[];
}
