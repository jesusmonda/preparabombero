import { Injectable } from '@nestjs/common';
import { TopicAndTopics } from 'src/common/interfaces/topic.interface';
import { PrismaService } from 'src/common/services/database.service';
import { CreateTopicDto, TopicType } from './dto/create-topic.dto';
import { Topic } from '@prisma/client';

@Injectable()
export class TopicService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async findTopic(id: number) : Promise<Topic> {
    return await this.prisma.topic.findUnique({
      where: {
        id: Number(id)
      }
    });
  }

  async delete(id: number) : Promise<Topic> {
    return await this.prisma.topic.delete({
      where: {
        id: Number(id)
      }
    });
  }

  async update(id: number, createTopicDto: CreateTopicDto) : Promise<Topic> {
    if (createTopicDto.type === TopicType.SECONDARY) {
      createTopicDto.categoryTitle = null;
    } else {
      createTopicDto.parentId = null;
    }
    delete createTopicDto.type;

    return await this.prisma.topic.update({
      where: {
        id: Number(id)
      },
      data: createTopicDto
    });
  }

  async create(createTopicDto: CreateTopicDto) : Promise<Topic> {
    if (createTopicDto.type === TopicType.SECONDARY) {
      createTopicDto.categoryTitle = null;
    } else {
      createTopicDto.parentId = null;
    }
    delete createTopicDto.type;

    return await this.prisma.topic.create({
      data: createTopicDto
    });
  }

  async findTopics() : Promise<(TopicAndTopics[])> {
    return await this.prisma.topic.findMany({
      include: {
        topics: true
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