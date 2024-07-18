import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/database.service';
import { Quiz } from '@prisma/client';
import { QuizOmitResult } from 'src/common/interfaces/quiz.interface';
import { QuizDto } from 'src/modules/quiz/dto/quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    private prisma: PrismaService
  ) {}

  async getQuizzesFromTopicIds(topicIds: number[]) : Promise<QuizOmitResult[]>{
    let quizs: QuizOmitResult[] = await this.prisma.quiz.findMany({
      select: {
        id: true,
        title: true,
        option1: true,
        option2: true,
        option3: true,
        option4: true,
        result: false,
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

  async findQuiz(quizId: number) : Promise<Quiz>{
    let reponse: Quiz = await this.prisma.quiz.findUnique({
      where: {
        id: Number(quizId)
      }
    });
    return reponse
  }

  async update(id: number, quizDto: QuizDto) : Promise<Quiz> {
    let reponse: Quiz = await this.prisma.quiz.update({
      where: {
        id: Number(id)
      },
      data: quizDto
    });
    return reponse
  }
  async create(quizDto: QuizDto) : Promise<Quiz> {
    let reponse: Quiz = await this.prisma.quiz.create({
      data: quizDto
    });
    return reponse
  }

  async delete(id: number) : Promise<Quiz> {
    let reponse: Quiz = await this.prisma.quiz.delete({
      where: {
        id: Number(id)
      }
    });
    return reponse
  }
}
