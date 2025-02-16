"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExamPractice, Question, QuizAttempt } from "@/types/exam";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Separator } from "../ui/separator";
import { Progress } from "../ui/progress";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";

const shuffleArray = (array: string[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

function ExamPracticeApp({ exam }: { exam: ExamPractice }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt>({
    answers: [],
    hintsUsed: [],
    explanationsUsed: [],
    timestamp: "0",
    score: 0,
    totalQuestions: 0,
    examId: exam.id,
  });
  const [isNewQuiz, setIsNewQuiz] = useState<boolean>(false);

  const router = useRouter();

  const loadHistory = (examId: string) => {
    try {
      const storedHistory = localStorage.getItem(`quizHistory-${examId}`);
      return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (error) {
      console.error(`Error loading quiz history for exam ${examId}:`, error);
      return [];
    }
  };

  const saveHistory = (examId: string, history: any[]) => {
    try {
      localStorage.setItem(`quizHistory-${examId}`, JSON.stringify(history));
    } catch (error) {
      console.error(`Error saving quiz history for exam ${examId}:`, error);
    }
  };

  const initializeQuiz = () => {
    const shuffled = exam.questions.map((q) => ({
      ...q,
      options: shuffleArray([...q.options]),
    }));
    setShuffledQuestions(shuffled);
    setCurrentAttempt({
      answers: Array(shuffled.length).fill([]),
      hintsUsed: Array(shuffled.length).fill(false),
      explanationsUsed: Array(shuffled.length).fill(false),
      timestamp: new Date().toISOString(),
      examId: exam.id,
      score: 0,
      totalQuestions: shuffled.length,
    });
  };

  useEffect(() => {
    const history = loadHistory(exam.id);
    setQuizHistory(history);
    initializeQuiz();
    setIsLoading(false);
  }, [exam.id]); // Add exam.id as a dependency

  const handleAnswerSelect = (option: string) => {
    if (!submitted && shuffledQuestions[currentQuestion]) {
      const newAnswers = [...currentAttempt.answers];
      if (shuffledQuestions[currentQuestion].type === "single") {
        newAnswers[currentQuestion] = [option];
        setSelectedAnswers([option]);
      } else {
        const currentAnswers = selectedAnswers.includes(option)
          ? selectedAnswers.filter((item) => item !== option)
          : [...selectedAnswers, option];
        setSelectedAnswers(currentAnswers);
        newAnswers[currentQuestion] = currentAnswers;
      }
      setCurrentAttempt({ ...currentAttempt, answers: newAnswers });
    }
  };

  const handleHintShow = () => {
    const newHintsUsed = [...currentAttempt.hintsUsed];
    newHintsUsed[currentQuestion] = true;
    setCurrentAttempt({ ...currentAttempt, hintsUsed: newHintsUsed });
    setShowHint(true);
  };

  const handleExplanationShow = () => {
    const newExplanationsUsed = [...currentAttempt.explanationsUsed];
    newExplanationsUsed[currentQuestion] = true;
    setCurrentAttempt({
      ...currentAttempt,
      explanationsUsed: newExplanationsUsed,
    });
    setShowExplanation(true);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const currentQuestionData = shuffledQuestions[currentQuestion];
    const isCorrect =
      JSON.stringify(selectedAnswers.sort()) ===
      JSON.stringify(currentQuestionData.correctAnswer.sort());

    // Update the answers in currentAttempt
    const newAnswers = [...currentAttempt.answers];
    newAnswers[currentQuestion] = selectedAnswers;

    // Update the score
    const newScore = isCorrect
      ? currentAttempt.score + 1
      : currentAttempt.score;

    setCurrentAttempt((prev) => ({
      ...prev,
      answers: newAnswers,
      score: newScore,
      totalQuestions: shuffledQuestions.length,
    }));

    setScore(newScore);
  };

  const handleNext = () => {
    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswers([]);
      setSubmitted(false);
      setShowHint(false);
      setShowExplanation(false);
    } else {
      // Update the final score and show results
      const finalAttempt = {
        ...currentAttempt,
        score: score,
        totalQuestions: shuffledQuestions.length,
      };
      setCurrentAttempt(finalAttempt);
      setShowResults(true);

      // Save the new attempt to history
      const updatedHistory = [...quizHistory, finalAttempt];
      setQuizHistory(updatedHistory);
      saveHistory(exam.id, updatedHistory);
    }
  };

  const resetQuiz = () => {
    setIsNewQuiz(true);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setSubmitted(false);
    setShowHint(false);
    setShowExplanation(false);
    setScore(0);
    setShowResults(false);
    setShowHistory(false);
    setCurrentAttempt({
      answers: [],
      hintsUsed: [],
      explanationsUsed: [],
      timestamp: new Date().toISOString(),
      score: 0,
      totalQuestions: shuffledQuestions.length,
      examId: exam.id,
    });
  };

  const getScore = (correct: number, totalQuestions: number) =>
    Math.round((correct / totalQuestions) * 100);

  const ResultsSummary = ({ attempt }: { attempt: QuizAttempt }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">
            Score: {getScore(attempt.score, attempt.totalQuestions)}%
          </h3>
          <p className="text-sm text-muted-foreground">
            {new Date(attempt.timestamp).toLocaleString()}
          </p>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              {getScore(attempt.score, attempt.totalQuestions) >= 75 ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-500" />
              )}
            </TooltipTrigger>
            <TooltipContent>
              {getScore(attempt.score, attempt.totalQuestions) > 75
                ? "Woohoo! You're crushing it! 🎉"
                : "Keep at it, champ! You're leveling up! 💪"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Question</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Used Hint</TableHead>
            <TableHead>Used Explanation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shuffledQuestions.map((q, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-medium">Question {idx + 1}</TableCell>
              <TableCell>
                {JSON.stringify(attempt.answers[idx]?.sort()) ===
                JSON.stringify(q.correctAnswer.sort()) ? (
                  <span className="text-green-600">Correct</span>
                ) : (
                  <span className="text-red-600">Incorrect</span>
                )}
              </TableCell>
              <TableCell>
                {attempt.hintsUsed[idx] ? (
                  <span className="text-yellow-600">Yes</span>
                ) : (
                  <span className="text-green-600">No</span>
                )}
              </TableCell>
              <TableCell>
                {attempt.explanationsUsed[idx] ? (
                  <span className="text-yellow-600">Yes</span>
                ) : (
                  <span className="text-green-600">No</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Loading Quiz...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (showHistory) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Quiz History</CardTitle>
            <CardDescription>Your previous attempts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {quizHistory.length > 0 ? (
              [...quizHistory].reverse().map((attempt, idx) => (
                <div key={idx}>
                  <ResultsSummary attempt={attempt} />
                  {idx < quizHistory.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">
                No previous attempts found
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => setShowHistory(false)} className="mr-2">
              Back
            </Button>
            <Button onClick={resetQuiz} variant="outline">
              Start New Quiz
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Quiz Results</CardTitle>
            <CardDescription>
              You scored {score} out of {shuffledQuestions.length} questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResultsSummary attempt={currentAttempt} />
          </CardContent>
          <CardFooter className="space-x-2">
            <Button onClick={resetQuiz}>Try Again</Button>
            <Button variant="outline" onClick={() => setShowHistory(true)}>
              View History
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (
    quizHistory.length > 0 &&
    currentQuestion === 0 &&
    !submitted &&
    !isNewQuiz
  ) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Welcome Back!</h1>
          <Card>
            <CardHeader>
              <CardTitle>Resume Your Practice</CardTitle>
              <CardDescription>
                You have previous quiz attempts. What would you like to do?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Previous Attempts</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Review your past performance and track your progress.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowHistory(true)}
                  >
                    View History
                  </Button>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">New Quiz</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start a fresh quiz to test your knowledge.
                  </p>
                  <Button className="w-full" onClick={resetQuiz}>
                    Start New Quiz
                  </Button>
                </Card>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Exam Overview
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-2xl font-bold">
                Question {currentQuestion + 1}
              </CardTitle>
              <Badge variant="outline">
                {currentQuestion + 1} of {shuffledQuestions.length}
              </Badge>
            </div>
            <Progress
              value={((currentQuestion + 1) / shuffledQuestions.length) * 100}
              className="h-2 mb-6"
            />
            <CardDescription className="text-lg font-medium">
              {shuffledQuestions[currentQuestion]?.question ||
                "Loading question..."}
            </CardDescription>
            {shuffledQuestions[currentQuestion]?.type === "multiple" && (
              <p className="text-sm text-muted-foreground mt-2">
                (Select multiple answers)
              </p>
            )}
          </CardHeader>
          <CardContent>
            {shuffledQuestions[currentQuestion] ? (
              <div className="grid gap-3">
                {shuffledQuestions[currentQuestion].options.map(
                  (option, index) => (
                    <Button
                      key={index}
                      variant={
                        selectedAnswers.includes(option)
                          ? submitted
                            ? shuffledQuestions[
                                currentQuestion
                              ].correctAnswer.includes(option)
                              ? "success"
                              : "destructive"
                            : "default"
                          : "outline"
                      }
                      className="w-full justify-start text-left h-auto py-3 px-4"
                      onClick={() => handleAnswerSelect(option)}
                    >
                      {option}
                    </Button>
                  )
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                Loading options...
              </p>
            )}

            {showHint && shuffledQuestions[currentQuestion] && (
              <Alert className="mt-6 bg-primary/10 border-primary/20">
                <AlertTitle className="font-semibold">Hint</AlertTitle>
                <AlertDescription className="italic">
                  {shuffledQuestions[currentQuestion].hint}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="flex gap-4 w-full">
              {!submitted && (
                <Button
                  variant="outline"
                  onClick={handleHintShow}
                  className="flex-1"
                  disabled={showHint}
                >
                  {showHint ? "Hint Shown" : "Show Hint"}
                </Button>
              )}
              {!submitted ? (
                <Button
                  onClick={handleSubmit}
                  disabled={selectedAnswers.length === 0}
                  className="flex-1"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNext} className="flex-1">
                  {currentQuestion === shuffledQuestions.length - 1
                    ? "Show Results"
                    : "Next Question"}
                </Button>
              )}
            </div>
            {(submitted || showHint) && (
              <Button
                variant="outline"
                onClick={handleExplanationShow}
                className="w-full"
                disabled={showExplanation}
              >
                {showExplanation ? "Explanation Shown" : "View Explanation"}
              </Button>
            )}
          </CardFooter>
        </Card>

        <AlertDialog open={showExplanation} onOpenChange={setShowExplanation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold">
                Explanation
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base mt-2">
                {shuffledQuestions[currentQuestion]?.explanation ||
                  "No explanation available"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>Close</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default ExamPracticeApp;
