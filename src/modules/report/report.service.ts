import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { PrismaService } from 'src/common/services/database.service';
import { Report } from '@prisma/client';
import { QuizOmitResult } from 'src/common/interfaces/quiz.interface';

@Injectable()
export class ReportService {
  constructor(
    private prisma: PrismaService
  ) {}

  async findId(id: number): Promise<Report> {
    return await this.prisma.report.findUnique({
      where: {
        id: Number(id)
      },
    });
  }

  async findAll(): Promise<Report[]> {
    return await this.prisma.report.findMany({
      select: {
        id: true,
        reason: true,
        quizId: true
      },
    });
  }

  async findQuizzes(quizzesId: number[]): Promise<QuizOmitResult[]> {
    return await this.prisma.quiz.findMany({
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
        created_at: true,
        pdfId: true
      },
      where: {
        id: {
          in: quizzesId
        }
      }
    });
  }

  async create(createReportDto: CreateReportDto): Promise<Report> {
    return await this.prisma.report.create({
      data: createReportDto
    })
  }

  async delete(id: number): Promise<Report> {
    return await this.prisma.report.delete({
      where: {
        id: Number(id)
      }
    })
  }
}
