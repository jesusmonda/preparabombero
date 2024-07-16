import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { PrismaService } from 'src/common/services/database.service';

@Module({
  imports: [],
  controllers: [QuizController],
  providers: [QuizService, PrismaService],
})
export class QuizModule {}
