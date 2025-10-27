import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/database.service';
import { Pdf } from '@prisma/client';

@Injectable()
export class PdfService {
  constructor(private prisma: PrismaService) {}

  async findAll(sort: string): Promise<Pdf[]> {
    const query: {city?: 'asc', community?: 'asc', name?: 'asc'} = {}
    if (sort == 'community') {
      query.community = 'asc';
    }else if (sort == 'city') {
      query.city = 'asc';
    } else {
      query.name = 'asc';
    }
    let response = await this.prisma.pdf.findMany({
      orderBy: query
    });
    response.map(x => x.name = x.name.replace(/\.[^/.]+$/, ""))

    return response;
  }
}