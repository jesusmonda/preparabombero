import { Report, Quiz } from "@prisma/client";

export type ReportAndQuiz = Report & { quiz: Quiz };