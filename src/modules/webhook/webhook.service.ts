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
}
