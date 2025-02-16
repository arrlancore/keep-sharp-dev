import { BlogHeader } from "@/components/blog/blog-header";
import { BlogFooter } from "@/components/blog/blog-footer";
import { Metadata } from "next";
import { appLocale, appUrl, brandName } from "@/config";
import { getAllExams } from "@/lib/exams";
import { ExamPracticeList } from "@/components/exams/ExamPracticeList";

export const metadata: Metadata = {
  title: "Exam Practice | " + brandName,
  description:
    "Prepare for your certification exams with our comprehensive practice tests and study materials.",
  openGraph: {
    title: "Exam Practice Tests and Study Materials",
    description:
      "Boost your exam readiness with our curated collection of practice tests and study resources for various certifications.",
    url: appUrl + "/exams",
    siteName: brandName,
    locale: appLocale,
    type: "website",
  },
};

export default async function ExamPracticePage() {
  const exams = await getAllExams();

  return (
    <div className="max-w-screen-xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <BlogHeader />
      <div className="pt-6" />
      <ExamPracticeList examPractices={exams} />
      <div className="pt-12" />
      <BlogFooter />
    </div>
  );
}
