import { ExamPractice } from "@/types/exam";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ExamPracticeListProps = {
  examPractices: ExamPractice[];
};

export function ExamPracticeList({ examPractices }: ExamPracticeListProps) {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Practice Exams</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {examPractices.map((exam) => (
            <Card key={exam.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{exam.title}</CardTitle>
                <CardDescription>{exam.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {exam.questions.length} questions
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/exam/${exam.id}`} passHref>
                  <Button className="w-full">Start Practice</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
