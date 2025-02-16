import { BlogHeader } from "@/components/blog/blog-header";
import { BlogFooter } from "@/components/blog/blog-footer";
import { Metadata } from "next";
import { appLocale, appUrl, brandName } from "@/config";
import { getExamById } from "@/lib/exams";
import { ExamOverview } from "@/components/exams/ExamOverview";

interface PageProps {
  params: {
    examId: string;
  };
}

export async function generateMetadata({
  params,
}: {
  params: { examId: string };
}): Promise<Metadata> {
  const exam = await getExamById(params.examId);

  if (!exam) {
    return {
      title: "Exam Not Found",
    };
  }

  return {
    title: exam.title + " | " + brandName,
    description:
      "Review and practice your " +
      exam.title +
      " with our comprehensive practice tests and study materials.",
    openGraph: {
      title: exam.title + " Practice Tests and Study Materials",
      description:
        "Practice your " +
        exam.title +
        " with our curated collection of practice tests and study resources.",
      url: appUrl + "/exams/" + params.examId,
      siteName: brandName,
      locale: appLocale,
      type: "website",
    },
  };
}

export default async function ExamOverviewPage({ params }: PageProps) {
  const exam = await getExamById(params.examId); // ReplacePageProps) {ctual exam ID

  return (
    <div className="max-w-screen-xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <BlogHeader />
      <div className="pt-6" />
      <ExamOverview exam={exam!} />
      <div className="pt-12" />
      <BlogFooter />
    </div>
  );
}
