import { Quiz } from "@prisma/client";

export type QuizOmitResult = Omit<Quiz, "result" | "pdf_name">;
export type QuizAndStatus = Quiz & {status: string}