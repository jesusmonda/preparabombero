import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { PrismaService } from 'src/common/services/database.service';
import { OptionalUserGuard } from 'src/common/guards/optional-user.guard';

@Module({
  controllers: [TopicController],
  providers: [TopicService, PrismaService, OptionalUserGuard],
})
export class TopicModule {}
