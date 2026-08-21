import { Module } from '@nestjs/common';
import { PrismaService } from 'src/common/services/database.service';
import { QuizModule } from '../quiz/quiz.module';
import { StudyController } from './study.controller';
import { StudyService } from './study.service';

@Module({
  imports: [QuizModule],
  controllers: [StudyController],
  providers: [StudyService, PrismaService],
})
export class StudyModule {}
