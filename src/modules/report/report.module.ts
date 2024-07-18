import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { PrismaService } from 'src/common/services/database.service';

@Module({
  imports: [],
  controllers: [ReportController],
  providers: [ReportService, PrismaService],
})
export class ReportModule {}
