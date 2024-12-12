import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/common/services/database.service';
import { Quiz, QuizStat } from '@prisma/client';
import { QuizOmitResult } from 'src/common/interfaces/quiz.interface';
import { QuizDto } from 'src/modules/quiz/dto/quiz.dto';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';

@Injectable()
export class QuizService {
  constructor(
    private readonly userService: UserService,
    private prisma: PrismaService
  ) {}

  async getAllChildren(parentIds: number[]): Promise<number[]> {
    const children = await this.prisma.topic.findMany({
        where: {
            parentId: {
                in: parentIds,
            },
        },
        select: {
            id: true, // Solo selecciona el ID
        },
    });

    // Almacenar todos los IDs encontrados
    const allChildrenIds = children.map(child => child.id);

    // Obtener los IDs de los hijos encontrados para la próxima iteración
    const childIds = children.map(child => child.id);

    // Si hay nuevos hijos, llamar recursivamente
    if (childIds.length > 0) {
        const childDescendantIds = await this.getAllChildren(childIds);
        allChildrenIds.push(...childDescendantIds);
    }

    return Array.from(new Set([...parentIds, ...allChildrenIds]));
  }

  async getQuizzesFromTopicIds(userId: number, value: number[] | number, type: "LIST" | "EXAM_PDF" | "EXAM_TOPIC", limit: number, order: "DESC" | "RANDOM") : Promise<QuizOmitResult[]>{
    const user: User = await this.userService.getUser(userId);
    const subscribed = (user.subscribed == true && user.subscription_id != null);
    const topicIds = (!subscribed) ? [662] : [value].flat();
    let searchQuery : object;
    
    if (type == "EXAM_TOPIC" || type == "LIST") {
      searchQuery = {
        topicId: {
          in: await this.getAllChildren(topicIds)
        }
      }
    }

    if (type == "EXAM_PDF") {
      if (!(user.subscribed == true && user.subscription_id != null) && !(user.role == "ADMIN")) {
        throw new HttpException('Usuario no subscrito', HttpStatus.BAD_REQUEST);
      }

      searchQuery = {
        pdfId: value
      }
    }

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
        ...searchQuery
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
    if (limit) quizs = (!subscribed) ? quizs.slice(0, 20) : quizs.slice(0, limit)
    return quizs;
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
