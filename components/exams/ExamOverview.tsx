"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExamPractice, QuizAttempt } from "@/types/exam";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Progress } from "../ui/progress";
import { BookOpen, CheckCircle, CopyCheck } from "lucide-react";

export function ExamOverview({ exam }: { exam: ExamPractice }) {
  const router = useRouter();

  // Get last attempt from localStorage
  const getLastAttempt = (): QuizAttempt | null => {
    try {
      const attempts: QuizAttempt[] = JSON.parse(
        localStorage.getItem(`quiz-attempts-${exam.id}`) || "[]"
      );
      return attempts.length > 0
        ? attempts.sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )[0]
        : null;
    } catch {
      return null;
    }
  };

  const lastAttempt = getLastAttempt();

  if (!exam) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Exam Not Found</CardTitle>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.back()}>Back to Exam List</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="text-3xl font-bold">{exam.title}</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              {exam.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-4">
                <BookOpen className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-medium">Total Questions</h3>
                  <p className="text-2xl font-bold">{exam.questions.length}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <CheckCircle className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-medium">Multiple Choice</h3>
                  <p className="text-2xl font-bold">
                    {exam.questions.filter((q) => q.type === "single").length}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <CopyCheck className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-medium">Multiple Answer</h3>
                  <p className="text-2xl font-bold">
                    {exam.questions.filter((q) => q.type === "multiple").length}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Prerequisites</h3>
              <div className="flex flex-wrap gap-2">
                {exam.prerequisites.map((prereq) => (
                  <span
                    key={prereq}
                    className="text-sm bg-secondary px-4 py-2 rounded-full font-medium"
                  >
                    {prereq}
                  </span>
                ))}
              </div>
            </div>

            {lastAttempt && (
              <div className="bg-secondary p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Last Attempt</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">
                      Score: {lastAttempt.score}/{lastAttempt.totalQuestions}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(lastAttempt.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <Progress
                    value={
                      (lastAttempt.score / lastAttempt.totalQuestions) * 100
                    }
                    className="h-3"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      Hints used: {lastAttempt.hintsUsed.filter(Boolean).length}
                    </span>
                    <span>
                      Explanations viewed:{" "}
                      {lastAttempt.explanationsUsed.filter(Boolean).length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-muted p-6">
            <div className="w-full flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                Back to List
              </Button>
              <Button
                className="flex-1"
                onClick={() => router.push(`/exam/${exam.id}/practices`)}
              >
                Start Practice Exam
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
