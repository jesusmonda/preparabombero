import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/database.service';
import { Pdf } from '@prisma/client';

@Injectable()
export class PdfService {
  constructor(private prisma: PrismaService) {}

  async findAll(sort: string): Promise<Pdf[]> {
    const query: {city?: 'desc', community?: 'desc'} = {}
    if (sort == 'community') {
      query.community = 'desc';
    } else {
      query.city = 'desc';
    }
    return await this.prisma.pdf.findMany({
      orderBy: query
    });
  }
}