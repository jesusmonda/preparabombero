import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TopicService } from './topic.service';
import { UserGuard } from 'src/common/guards/user.guard';
import { Quiz } from '../quiz/entities/quiz.entity';

type Topic = {
  id: number;
  title: string;
  categoryTitle: string;
  quizCount: number;
  subtopic: Topic[];
  quizs: Quiz[];
};

type quizCount = {
  topicId: number;
  count: number;
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
    const topics: any[] = await this.topicService.findTopics();
    const quizCount: quizCount[] = await this.topicService.countQuizs();
    return this.transformTopics(topics, quizCount);
  }

  transformTopics = (topics: Topic[], quizCount: quizCount[]): GroupedTopics => {
    const groupedTopics: GroupedTopics = {};

    // Mapa de todos los topics por id para facilitar la búsqueda
    const topicMap: { [key: number]: Topic } = {};
    topics.forEach(topic => {
      topicMap[topic.id] = { ...topic, subtopic: [], quizCount: quizCount.find(x => x.topicId == topic.id)?.count || 0 };
      delete topicMap[topic.id]?.quizs;
    });
  
    // Construir la jerarquía de subtopics
    topics.forEach(topic => {
      if (topic.subtopic && topic.subtopic.length > 0) {
        topic.subtopic.forEach(sub => {
          topicMap[sub.id] = { ...sub, quizCount: quizCount.find(x => x.topicId == sub.id)?.count || 0, subtopic: topicMap[sub.id]?.subtopic || [] };
        });
        topicMap[topic.id].subtopic = topic.subtopic.map(sub => topicMap[sub.id]);
        topicMap[topic.id].quizCount = quizCount.find(x => x.topicId == topic.id)?.count || 0
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
