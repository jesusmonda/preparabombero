import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { PrismaService } from 'src/common/services/database.service';
import { Report } from '@prisma/client';
import { QuizOmitResult } from 'src/common/interfaces/quiz.interface';

type ReportResponse = Pick<Report, 'id' | 'reason' | 'quizId'> & {
  reporter: {
    email: string;
    name: string;
    surname: string;
  } | null;
};

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

  async findAll(): Promise<ReportResponse[]> {
    const reports = await this.prisma.report.findMany({
      select: {
        id: true,
        reason: true,
        quizId: true,
        user: {
          select: {
            email: true,
            name: true,
            surname: true,
          },
        },
      },
    });

    return reports.map(({ user, ...report }) => ({
      ...report,
      reporter: user,
    }));
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
        packId: true,
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

  async create(userId: number, createReportDto: CreateReportDto): Promise<ReportResponse> {
    const report = await this.prisma.report.create({
      data: {
        ...createReportDto,
        userId: Number(userId),
      },
      select: {
        id: true,
        reason: true,
        quizId: true,
        user: {
          select: {
            email: true,
            name: true,
            surname: true,
          },
        },
      },
    });

    const { user, ...createdReport } = report;
    return {
      ...createdReport,
      reporter: user,
    };
  }

  async delete(id: number): Promise<Report> {
    return await this.prisma.report.delete({
      where: {
        id: Number(id)
      }
    })
  }
}
