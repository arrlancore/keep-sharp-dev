import { ReactElement } from "react";

export type QuestionType = "single" | "multiple";
export interface Question {
  id: number;
  question: string | ReactElement;
  type: QuestionType;
  options: string[];
  correctAnswer: string[];
  hint: string;
  explanation: string | ReactElement;
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
export interface QuizProgress {
  currentQuestionIndex: number;
  currentAttempt: QuizAttempt;
}
