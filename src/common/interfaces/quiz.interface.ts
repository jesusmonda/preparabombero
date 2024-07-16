import { Quiz } from "@prisma/client";

export type QuizOmitResult = Omit<Quiz, "result">;