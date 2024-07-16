import { Injectable } from '@nestjs/common';
import { Topic } from '@prisma/client';
import { QuizCount, TopicAndSubtopics } from 'src/common/interfaces/topic.interface';
import { PrismaService } from 'src/common/services/database.service';

@Injectable()
export class TopicService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async findTopics() : Promise<(TopicAndSubtopics[])> {
    return await this.prisma.topic.findMany({
      include: {
        subtopics: true
      }
    });
  }

  async quizCount(): Promise<any> {
    return await this.prisma.quiz.groupBy({
      by: ['topicId'],
      _count: {
        topicId: true
      }
    });
  }
}