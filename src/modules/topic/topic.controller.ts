import { Controller, BadRequestException, Get, Post, Put, Delete, Body, HttpStatus, Param, HttpException, Request, UseGuards } from '@nestjs/common';
import { TopicService } from './topic.service';
import { UserGuard } from 'src/common/guards/user.guard';
import { OptionalUserGuard } from 'src/common/guards/optional-user.guard';
import { QuizCount, TopicAndTopics } from 'src/common/interfaces/topic.interface';
import { Topic } from '@prisma/client';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { CreateTopicDto } from './dto/create-topic.dto';

type TopicsResponse = {
  [key: string]: (TopicAndTopics & {
    quizCount: number;
    availableQuizCount: number;
    totalQuizCount: number;
    expanded: boolean;
  })[];
};

@Controller('topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Get()
  @UseGuards(OptionalUserGuard)
  async findAll(@Request() request: Request) {
    const topics: TopicAndTopics[] = await this.topicService.findTopics();
    const quizzesCount: QuizCount[] = await this.topicService.quizCount(
      request['user']?.userId,
    );
    return this.transformTopics(topics, quizzesCount)
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  async findOne(@Param('id') topicId: string) {
    if (!topicId || topicId == '') {
      throw new HttpException('TopicId invalido', HttpStatus.BAD_REQUEST);
    }
    const topicIdNumber: number = Number(topicId)
    if (isNaN(topicIdNumber)) {
      throw new HttpException('TopicId invalido', HttpStatus.BAD_REQUEST);
    }

    let topic: Topic = await this.topicService.findTopic(topicIdNumber)
    return topic;
  }

  transformTopics = (topics: Topic[], quizzesCount: QuizCount[]): TopicsResponse => {
    // Función auxiliar para obtener el conteo de quizzes para un topic
    const getQuizCounts = (topicId: number) => {
      const quizCount = quizzesCount.find(q => q.topicId === topicId);
      return {
        available: quizCount?.availableCount ?? 0,
        total: quizCount?._count.topicId ?? 0,
      };
    };
  
    // Crear un mapa de todos los topics por id
    const topicMap = new Map(topics.map(topic => [topic.id, { ...topic, topics: [] }]));
  
    // Construir la estructura jerárquica
    topicMap.forEach(topic => {
      if (topic.parentId !== null && topicMap.has(topic.parentId)) {
        topicMap.get(topic.parentId).topics.push(topic);
      }
    });
  
    // Función para transformar un solo topic
    const transformTopic = (topic: any): any => {
      const directQuizCounts = getQuizCounts(topic.id);
      const topics = topic.topics
        .map(transformTopic)
        .sort((a, b) => a.order - b.order);
      
      const availableQuizCount = directQuizCounts.available + topics.reduce((sum, sub) => sum + sub.availableQuizCount, 0);
      const totalQuizCount = directQuizCounts.total + topics.reduce((sum, sub) => sum + sub.totalQuizCount, 0);
  
      return {
        id: topic.id,
        title: topic.title,
        url: topic.url,
        categoryTitle: topic.categoryTitle || null,
        parentId: topic.parentId,
        expanded: !!topic.categoryTitle,
        quizCount: totalQuizCount,
        availableQuizCount,
        totalQuizCount,
        created_at: topic.created_at,
        order: topic.order,
        topics
      };
    };
  
    // Transformar y ordenar los topics de nivel superior
    const transformedTopics = Array.from(topicMap.values())
      .filter(topic => topic.parentId === null)
      .map(transformTopic)
      .sort((a, b) => a.order - b.order);
  
    // Agrupar por categoryTitle
    const groupedTopics = transformedTopics.reduce((acc, topic) => {
      if (topic.categoryTitle) {
        if (!acc[topic.categoryTitle]) {
          acc[topic.categoryTitle] = [];
        }
        acc[topic.categoryTitle].push(topic);
      }
      return acc;
    }, {});
  
    // Ordenar los topics dentro de cada categoría
    Object.keys(groupedTopics).forEach(category => {
      groupedTopics[category].sort((a, b) => a.order - b.order);
    });
  
    return groupedTopics;
  };

  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() createTopicDto: CreateTopicDto) {
    return await this.topicService.create(createTopicDto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async update(@Param('id') id: string, @Body() createTopicDto: CreateTopicDto) {
    if (!id || id == '') {
      throw new HttpException('Id invalido', HttpStatus.BAD_REQUEST);
    }
    const idNumber: number = Number(id)
    if (isNaN(idNumber)) {
      throw new HttpException('Id invalido', HttpStatus.BAD_REQUEST);
    }

    let quiz: Topic = await this.topicService.findTopic(idNumber);
    if (quiz == null) {
      throw new HttpException('Tema no encontrado', HttpStatus.NOT_FOUND);
    }

    return await this.topicService.update(idNumber, createTopicDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async delete(@Param('id') id: string) {
    if (!id || id == '') {
      throw new HttpException('Id invalido', HttpStatus.BAD_REQUEST);
    }
    const idNumber: number = Number(id)
    if (isNaN(idNumber)) {
      throw new HttpException('Id invalido', HttpStatus.BAD_REQUEST);
    }

    let quiz: Topic = await this.topicService.findTopic(idNumber);
    if (quiz == null) {
      throw new HttpException('Tema no encontrado', HttpStatus.NOT_FOUND);
    }

    return await this.topicService.delete(idNumber);
  }
}
