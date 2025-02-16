import path from "path";
import fs from "fs";
import { ExamPractice } from "@/types/exam";

class ExamLoader {
  EXAMS_PATH = path.join(process.cwd(), "content/exams");
  exams: ExamPractice[] = [];
  getExamsFilePaths(): string[] {
    return fs
      .readdirSync(this.EXAMS_PATH)
      .filter((path) => /\.json?$/.test(path));
  }

  async getExams(): Promise<ExamPractice[]> {
    if (this.exams.length) {
      return this.exams;
    }

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
  return exams.find((exam) => exam.id === examId);
};
