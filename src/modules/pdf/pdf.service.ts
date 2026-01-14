import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/database.service';
import { Pdf } from '@prisma/client';

@Injectable()
export class PdfService {
  constructor(private prisma: PrismaService) {}

  async findAll(sort: string): Promise<Pdf[]> {
    const orderBy: any[] = [];

    if (sort === 'community') {
      orderBy.push({ community: 'asc' });
    } else if (sort === 'city') {
      orderBy.push({ city: 'asc' });
    }

    const response = await this.prisma.pdf.findMany({
      orderBy,
    });

    // 🔹 Orden especial por name + año
    if (sort === 'name') {
      response.sort((a, b) => {
        // quitar el año y la extensión para comparar texto
        const baseA = a.name.replace(/\s\d{4}(\.[^.]+)?$/, '');
        const baseB = b.name.replace(/\s\d{4}(\.[^.]+)?$/, '');

        const textCompare = baseA.localeCompare(baseB, 'es');
        if (textCompare !== 0) return textCompare;

        // si el texto es igual, ordenar por año numérico
        const yearA = Number(a.name.match(/\d{4}/)?.[0] ?? 0);
        const yearB = Number(b.name.match(/\d{4}/)?.[0] ?? 0);

        return yearA - yearB;
      });
    }

    // quitar extensión del nombre (como ya hacías)
    response.forEach((x) => {
      x.name = x.name.replace(/\.[^.]+$/, '');
    });

    return response;
  }
}