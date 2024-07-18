import { Quiz } from "@prisma/client";

export type QuizOmitResult = Omit<Quiz, "result">;
export type QuizAndStatus = Quiz & {status: string}