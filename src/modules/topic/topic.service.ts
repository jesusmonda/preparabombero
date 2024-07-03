import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Topic } from 'src/database/entities/topic.entity';
import { isNotEmpty } from 'class-validator';
import { Quiz } from 'src/database/entities/quiz.entity';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
  ) {}

  async findTopics() {
    return await this.topicRepository.find({
      relations: ['subtopic', 'quizs']
    });
  }

  async countQuizs() {
    const query = this.quizRepository.createQueryBuilder('quiz')
        .select('quiz.topicId', 'topicId')
        .addSelect('COUNT(quiz.topicId)', 'count')
        .groupBy('quiz.topicId');

    const result = await query.getRawMany();

    return result;
  }
}
