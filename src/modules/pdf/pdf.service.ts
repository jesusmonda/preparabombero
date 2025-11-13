import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/database.service';
import { Pdf } from '@prisma/client';

@Injectable()
export class PdfService {
  constructor(private prisma: PrismaService) {}

  async findAll(sort: string): Promise<Pdf[]> {
    // array de criterios de ordenación
    const orderBy: any[] = [];

    if (sort === 'community') {
      orderBy.push({ community: 'asc' });
    } else if (sort === 'city') {
      orderBy.push({ city: 'asc' });
    } else {
      // por defecto: name, luego year
      orderBy.push({ name: 'asc' }, { year: 'asc' });
    }

    const response = await this.prisma.pdf.findMany({
      orderBy,
    });

    // quitar extensión del nombre si quieres seguir haciéndolo
    response.forEach((x) => {
      x.name = x.name.replace(/\.[^.]+$/, '');
    });

    return response;
  }
}