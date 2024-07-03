import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { Topic } from 'src/database/entities/topic.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from 'src/database/entities/quiz.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Topic, Quiz])
  ],
  controllers: [TopicController],
  providers: [TopicService],
})
export class TopicModule {}
