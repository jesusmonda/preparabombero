import { Injectable } from '@nestjs/common';
import { UserNotSensitive } from 'src/common/interfaces/user.interface';
import { PrismaService } from 'src/common/services/database.service';
import Stripe from 'stripe';

@Injectable()
export class WebhookService {

  stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET, {
      apiVersion: '2024-06-20',
    });
  }

  updateSubscription(userId: number, action: string, subscription_id: string): Promise<UserNotSensitive> {
    userId = Number(userId);

    if (action == "CANCELED") {
      return this.prisma.user.update({
        select: {
          id: true,
          email: true,
          name: true,
          surname: true,
          subscribed: true,
          cancellation_pending: true
        },
        where: {
          id: userId
        },
        data: {
          subscribed: false,
          subscription_id: null,
          cancellation_pending: false
        }
      })
    } else {
      return this.prisma.user.update({
        select: {
          id: true,
          email: true,
          name: true,
          surname: true,
          subscribed: true,
          cancellation_pending: true
        },
        where: {
          id: userId
        },
        data: {
          subscribed: true,
          subscription_id: subscription_id,
          cancellation_pending: false
        }
      })
    }
  }

  async packCheckoutCompleted(session: Stripe.Checkout.Session) {
    if (session.payment_status !== 'paid') {
      return { received: true, processed: false };
    }

    const userId = Number(session.metadata?.userId);
    const packId = Number(session.metadata?.packId);

    if (!Number.isInteger(userId) || !Number.isInteger(packId)) {
      throw new Error('Checkout de pack sin metadata válida');
    }

    const pack = await this.prisma.pack.findUnique({
      where: { id: packId },
      select: { id: true },
    });

    if (!pack) {
      throw new Error('El pack del checkout no existe');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error('El usuario del checkout no existe');
    }

    const userPack = await this.prisma.userPack.upsert({
      where: {
        userId_packId: {
          userId,
          packId,
        },
      },
      update: {},
      create: {
        userId,
        packId,
      },
    });

    return { received: true, processed: true, userPackId: userPack.id };
  }
}
