import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/database.service';
import { Quiz } from '@prisma/client';
import { QuizOmitResult } from 'src/common/interfaces/quiz.interface';

@Injectable()
export class QuizService {
  constructor(
    private prisma: PrismaService
  ) {}

  async getQuizFromTopicId(topicIds: number[]) : Promise<QuizOmitResult[]>{
    let quizs: QuizOmitResult[] = await this.prisma.quiz.findMany({
      select: {
        id: true,
        title: true,
        option1: true,
        option2: true,
        option3: true,
        option4: true,
        topicId: true
      },
      where: {
        topicId: {
          in: topicIds.map(topicId => Number(topicId))
        }
      }
    });
    quizs = quizs.sort(function(){ return 0.5 - Math.random() });
    return quizs.slice(0, 100)
  }

  async getQuiz(quizId: number) : Promise<Quiz>{
    let quiz: Quiz = await this.prisma.quiz.findUnique({
      where: {
        id: quizId
      }
    });
    return quiz
  }
}
