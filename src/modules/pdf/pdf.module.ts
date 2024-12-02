import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { PrismaService } from 'src/common/services/database.service';

@Module({
  controllers: [PdfController],
  providers: [PdfService, PrismaService],
})
export class PdfModule {}
