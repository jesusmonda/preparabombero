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
        // 1️⃣ normalizar nombre: quitar extensión y año
        const normalize = (name: string) =>
          name
            .replace(/\.[^.]+$/, '')       // quitar .pdf
            .replace(/\b\d{4}\b.*$/, '')   // quitar año y lo que venga después
            .trim();

        const baseA = normalize(a.name);
        const baseB = normalize(b.name);

        // 2️⃣ comparar texto (ignorando acentos)
        const textCompare = baseA.localeCompare(baseB, 'es', {
          sensitivity: 'base',
        });
        if (textCompare !== 0) return textCompare;

        // 3️⃣ comparar año como número
        const yearA = Number(a.name.match(/\b\d{4}\b/)?.[0] ?? 0);
        const yearB = Number(b.name.match(/\b\d{4}\b/)?.[0] ?? 0);

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