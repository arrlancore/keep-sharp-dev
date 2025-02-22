import path from "path";
import fs from "fs";
import { ExamPractice, Question } from "@/types/exam";

import { MDXRemote } from "next-mdx-remote/rsc";
import components from "@/lib/mdx/mdx-components";
import { ReactElement } from "react";

async function convertMDToContent(
  source: string,
  components = {} as any
): Promise<ReactElement> {
  const mdxContent = await MDXRemote({
    source,
    components,
  });

  return mdxContent;
}

class ExamLoader {
  EXAMS_PATH = path.join(process.cwd(), "content/exams");
  exams: ExamPractice[] = [];
  getExamsFilePaths(): string[] {
    return fs
      .readdirSync(this.EXAMS_PATH)
      .filter((path) => /\.json?$/.test(path));
  }

  async getExams(): Promise<ExamPractice[]> {
    // if (this.exams.length) {
    //   return this.exams;
    // }

    this.exams = await Promise.all(
      this.getExamsFilePaths().map(async (fileName) => {
        const filePath = path.join(this.EXAMS_PATH, fileName);
        const examData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        return examData;
      })
    );

    return this.exams;
  }
}

const examLoader = new ExamLoader();

export const getAllExams = async () => {
  return examLoader.getExams();
};

export const getExamById = async (examId: string) => {
  const exams = await examLoader.getExams();
  const exam = exams.find((exam) => exam.id === examId);

  if (!exam) return null;

  // Transform questions and explanations to MDX content
  const transformedQuestions = await Promise.all(
    exam.questions.map(async (question) => {
      const transformedQuestion = { ...question };

      // Transform
      if (question.question) {
        transformedQuestion.question = await convertMDToContent(
          question.question as string
        );
      }
      if (question.explanation) {
        transformedQuestion.explanation = await convertMDToContent(
          question.explanation as string
        );
      }

      if (question.options.length) {
        const options = await Promise.all(
          question.options.map(
            async (option) => await convertMDToContent(option as string)
          )
        );
        transformedQuestion.options = options;
      }

      return transformedQuestion;
    })
  );

  return {
    ...exam,
    questions: transformedQuestions,
  };
};
