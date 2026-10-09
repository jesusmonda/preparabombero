import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from 'src/common/services/database.service';

@Injectable()
export class PackService {
  private readonly stripe: Stripe;

  constructor(private readonly prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET, {
      apiVersion: '2024-06-20',
    });
  }

  async getConfiguration() {
    const rows = await this.prisma.pack.findMany({
      select: {
        comunidad: true,
        ciudad: true,
        administracion: true,
      },
      orderBy: [
        { comunidad: 'asc' },
        { ciudad: 'asc' },
        { administracion: 'asc' },
      ],
    });

    const result = Object.create(null);

    for (const row of rows) {
      if (!row.comunidad) continue;

      result[row.comunidad] ??= {};

      if (!row.ciudad) continue;
      result[row.comunidad][row.ciudad] ??= [];

      if (
        row.administracion &&
        !result[row.comunidad][row.ciudad].includes(row.administracion)
      ) {
        result[row.comunidad][row.ciudad].push(row.administracion);
      }
    }

    return result;
  }

  async findAll(
    userId: number,
    search?: string,
    comunidad?: string,
    ciudad?: string,
    administracion?: string,
  ) {
    const filters: any[] = [];

    if (search) {
      filters.push({
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { comunidad: { contains: search, mode: 'insensitive' } },
          { ciudad: { contains: search, mode: 'insensitive' } },
          { administracion: { contains: search, mode: 'insensitive' } },
          { check1: { contains: search, mode: 'insensitive' } },
          { check2: { contains: search, mode: 'insensitive' } },
          { check3: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (comunidad) {
      filters.push({ comunidad: { equals: comunidad, mode: 'insensitive' } });
    }
    if (ciudad) {
      filters.push({ ciudad: { equals: ciudad, mode: 'insensitive' } });
    }
    if (administracion) {
      filters.push({
        administracion: { equals: administracion, mode: 'insensitive' },
      });
    }

    const packs = await this.prisma.pack.findMany({
      where: filters.length ? { AND: filters } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { quizzes: true } },
        userPacks: {
          where: { userId: Number(userId) },
          select: { id: true },
        },
      },
    });

    return packs.map(({ _count, userPacks, ...pack }) => ({
      ...pack,
      numQuestions: _count.quizzes,
      purchased: userPacks.length > 0,
    }));
  }

  async createCheckoutSession(userId: number, packId: number, origin?: string) {
    const pack = await this.getPackOrThrow(packId);

    if (!pack.stripePriceId) {
      throw new BadRequestException(
        'El pack no tiene un precio configurado en Stripe',
      );
    }

    const alreadyPurchased = await this.prisma.userPack.findUnique({
      where: {
        userId_packId: {
          userId: Number(userId),
          packId: Number(packId),
        },
      },
    });

    if (alreadyPurchased) {
      throw new BadRequestException('El usuario ya ha comprado este pack');
    }

    const redirectUrl =
      process.env.ENVIRONMENT == 'prod'
        ? `${origin}/refuerzos`
        : 'http://localhost:4200/refuerzos';
    const metadata = {
      userId: String(userId),
      packId: String(packId),
    };

    const paymentLink = await this.stripe.paymentLinks.create({
      line_items: [{ price: pack.stripePriceId, quantity: 1 }],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: redirectUrl,
        },
      },
      invoice_creation: {
         enabled: true,
      },
      allow_promotion_codes: false,
      billing_address_collection: 'auto',
      metadata,
      payment_intent_data: { metadata },
      restrictions: {
        completed_sessions: {
          limit: 1,
        },
      },
    });

    return { url: paymentLink.url, paymentLinkId: paymentLink.id };
  }

  async getPurchasedQuestions(userId: number, packId: number) {
    const userPack = await this.prisma.userPack.findUnique({
      where: {
        userId_packId: {
          userId: Number(userId),
          packId: Number(packId),
        },
      },
      include: {
        pack: {
          select: {
            id: true,
            nombre: true,
            comunidad: true,
            ciudad: true,
            administracion: true,
            check1: true,
            check2: true,
            check3: true,
          },
        },
      },
    });

    if (!userPack) {
      throw new NotFoundException('El usuario no ha comprado este pack');
    }

    const questions = await this.prisma.quiz.findMany({
      where: { packId: Number(packId) },
      orderBy: { created_at: 'asc' },
      select: {
        id: true,
        title: true,
        option1: true,
        option2: true,
        option3: true,
        option4: true,
        topicId: true,
        justification: true,
        created_at: true,
        pdfId: true,
        topic: {
          select: { title: true },
        },
      },
    });

    return {
      pack: userPack.pack,
      questions: questions.map(({ topic, ...question }) => ({
        ...question,
        topicTitle: topic?.title ?? null,
      })),
    };
  }

  private async getPackOrThrow(id: number) {
    const pack = await this.prisma.pack.findUnique({
      where: { id: Number(id) },
    });

    if (!pack) {
      throw new NotFoundException('Pack no encontrado');
    }

    return pack;
  }
}
