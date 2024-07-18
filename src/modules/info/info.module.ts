import { Module } from '@nestjs/common';
import { InfoService } from './info.service';
import { InfoController } from './info.controller';
import { PrismaService } from 'src/common/services/database.service';

@Module({
  imports: [],
  controllers: [InfoController],
  providers: [InfoService, PrismaService],
})
export class InfoModule {}
