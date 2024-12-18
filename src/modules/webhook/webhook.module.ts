import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { PrismaService } from 'src/common/services/database.service';
import { UserService } from '../user/user.service';

@Module({
  controllers: [WebhookController],
  providers: [WebhookService, PrismaService, UserService],
})
export class WebhookModule {}
