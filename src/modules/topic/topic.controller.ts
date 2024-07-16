import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TopicService } from './topic.service';
import { UserGuard } from 'src/common/guards/user.guard';
import { QuizCount, TopicAndSubtopics } from 'src/common/interfaces/topic.interface';
import { Topic } from '@prisma/client';

type TopicsResponse = {
  [key: string]: (TopicAndSubtopics & {
    quizCount: number;
    expanded: boolean;
  })[];
};

@Controller('topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @UseGuards(UserGuard)
  @Get()
  async findAll() {
    const topics: TopicAndSubtopics[] = await this.topicService.findTopics();
    const quizzesCount: QuizCount[] = await this.topicService.quizCount();
    return this.transformTopics(topics, quizzesCount)
  }

  transformTopics = (topics: Topic[], quizzesCount: QuizCount[]): TopicsResponse => {
    // Función auxiliar para obtener el conteo de quizzes para un topic
    const getQuizCount = (topicId: number): number => {
      const quizCount = quizzesCount.find(q => q.topicId === topicId);
      return quizCount ? quizCount._count.topicId : 0;
    };
  
    // Crear un mapa de todos los topics por id
    const topicMap = new Map(topics.map(topic => [topic.id, { ...topic, subtopics: [] }]));
  
    // Construir la estructura jerárquica
    topicMap.forEach(topic => {
      if (topic.parentId !== null && topicMap.has(topic.parentId)) {
        topicMap.get(topic.parentId).subtopics.push(topic);
      }
    });
  
    // Función para transformar un solo topic
    const transformTopic = (topic: any): any => {
      const directQuizCount = getQuizCount(topic.id);
      const subtopics = topic.subtopics
        .map(transformTopic)
        .sort((a, b) => a.order - b.order);
      
      const totalQuizCount = directQuizCount + subtopics.reduce((sum, sub) => sum + sub.quizCount, 0);
  
      return {
        id: topic.id,
        title: topic.title,
        categoryTitle: topic.categoryTitle || null,
        parentId: topic.parentId,
        expanded: !!topic.categoryTitle,
        quizCount: totalQuizCount,
        order: topic.order,
        subtopics
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
}
