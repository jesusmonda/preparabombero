import { Injectable } from '@nestjs/common';
import { User, QuizStat } from '@prisma/client';
import { UserNotSensitive } from 'src/common/interfaces/user.interface';
import { PrismaService } from 'src/common/services/database.service';
import Stripe from 'stripe';

@Injectable()
export class UserService {

  stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET, {
      apiVersion: '2024-06-20',
    });
  }

  async createSubscriptionLink(host: string, userId: number) {
    const subscription_data = await this.stripe.paymentLinks.create({
      line_items: [
        {
          price: 'price_1QUua4FR1WvHugBQhhvrW7tO',
          quantity: 1,
        },
      ],
      after_completion: {
        type: "redirect",
        redirect: {
          url: process.env.ENVIRONMENT == "prod" ? `https://${host}/profile` : "http://localhost:4200/profile"
        }
      },
      allow_promotion_codes: false,
      billing_address_collection: "auto",
      currency: "EUR",
      subscription_data: {
        metadata: {
          userId: userId
        }
      },
      restrictions: {
        completed_sessions: {
          limit: 1
        }
      }
    });
    return {url: subscription_data.url}
  }

  async getUser(userId: number): Promise<User> {
    userId = Number(userId);

    return await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    });
  }

  async deleteSubscription(subscriptionId: string, userId: number): Promise<UserNotSensitive> {
    await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    return await this.prisma.user.update({
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
        cancellation_pending: true
      }
    });
  }

  async getQuizStats(userId: number): Promise<QuizStat[]> {
    userId = Number(userId);

    return await this.prisma.quizStat.findMany({
      skip: 0,
      take: 6,
      where: {
        userId: userId
      },
      orderBy: [
        {
          created_at: 'desc',
        },
      ]
    });
  }
}
