import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/database.service';
import { Quiz, QuizStat } from '@prisma/client';
import { QuizOmitResult } from 'src/common/interfaces/quiz.interface';
import { QuizDto } from 'src/modules/quiz/dto/quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    private prisma: PrismaService
  ) {}

  async getQuizzesFromTopicIds(userId: number, topicIds: number[], order: "DESC" | "RANDOM") : Promise<QuizOmitResult[]>{
    topicIds = (userId == 1) ? [1] : topicIds;

    const query: any = {
      select: {
        id: true,
        title: true,
        option1: true,
        option2: true,
        option3: true,
        option4: true,
        result: false,
        topicId: true,
        justification: true,
        created_at: true
      },
      where: {
        topicId: {
          in: topicIds.map(topicId => Number(topicId))
        }
      }
    }
    if (order === "DESC") {
      query.orderBy = [
        {
          created_at: 'desc',
        },
      ]
    }
  
    let quizs: QuizOmitResult[] = await this.prisma.quiz.findMany(query);
    if (order === "RANDOM") quizs = quizs.sort(function(){ return 0.5 - Math.random() });
    return (userId == 1) ? quizs.slice(0, 20) : quizs.slice(0, 100)
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

  async createStats(userId: number, success: number, fail: number, not_answered: number) : Promise<QuizStat> {
    userId = Number(userId)
    success = Number(success)
    fail = Number(fail)
    not_answered = Number(not_answered)

    let response: QuizStat = await this.prisma.quizStat.create({
      data: {
        userId,
        success,
        fail,
        not_answered
      }
    });
    return response
  }
}
