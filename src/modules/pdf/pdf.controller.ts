import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { Pdf } from '@prisma/client';
import { UserGuard } from 'src/common/guards/user.guard';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get()
  @UseGuards(UserGuard)
  async findAll() {
    let response: Pdf[] = await this.pdfService.findAll();
    return response;
  }
}
