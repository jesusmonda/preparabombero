import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TopicService } from './topic.service';
import { UserGuard } from 'src/common/guards/user.guard';
import { Quiz } from '@prisma/client';

type Topic = {
  id: number;
  title: string;
  categoryTitle: string;
  quizCount?: number;
  parentId: number;
  subtopics?: Topic[];
  quizzes?: Quiz[];
};

type quizCount = {
  topicId: number;
  _count: {
    topicId: number
  };
};

type GroupedTopics = {
  [key: string]: Topic[];
};

@Controller('topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @UseGuards(UserGuard)
  @Get()
  async findAll() {
    const topics: Topic[] = await this.topicService.findTopics();
    const quizzesCount: quizCount[] = await this.topicService.quizCount();
    return this.transformTopics(topics, quizzesCount);
  }

  transformTopics = (topics: Topic[], quizzesCount: quizCount[]): GroupedTopics => {
    const groupedTopics: GroupedTopics = {};

    // Mapa de todos los topics por id para facilitar la búsqueda
    const topicMap: { [key: number]: Topic } = {};
    topics.forEach(topic => {
      topicMap[topic.id] = { ...topic, subtopics: [] };
      delete topicMap[topic.id]?.quizzes;
    });
  
    // Construir la jerarquía de subtopicss
    topics.forEach(topic => {
      if (topic.subtopics && topic.subtopics.length > 0) {
        topic.subtopics.forEach(sub => {
          const quizCount = quizzesCount.find(x => x.topicId == topic.id)?._count.topicId || 0;
          topicMap[sub.id] = { ...sub, quizCount: quizCount, subtopics: topicMap[sub.id]?.subtopics || [] };
        });
        topicMap[topic.id].subtopics = topic.subtopics.map(sub => topicMap[sub.id]);
        delete topicMap[topic.id].quizCount
      }
    });
  
    // Agrupar por categoryTitle
    topics.forEach(topic => {
      if (topic.categoryTitle) {
        if (!groupedTopics[topic.categoryTitle]) {
          groupedTopics[topic.categoryTitle] = [];
        }
        if (!groupedTopics[topic.categoryTitle].some(t => t.id === topic.id)) {
          groupedTopics[topic.categoryTitle].push(topicMap[topic.id]);
        }
      }
    });
    return groupedTopics;
  };
}
