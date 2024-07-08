import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/database.service';

@Injectable()
export class TopicService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async findTopics() {
    return await this.prisma.topic.findMany({
      include: {
        subtopics: true,
        quizzes: true
      }
    });
  }

  async quizCount() {
    return await this.prisma.quiz.groupBy({
      by: ['topicId'],
      _count: {
        topicId: true
      },
    });
  }
}
