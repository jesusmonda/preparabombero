import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';
import { Logger } from '@nestjs/common';

@Controller('webhook')
export class WebhookController {
  constructor(private userService: UserService, private readonly webhookService: WebhookService) {}

  @Post('')
  async webhook(@Body() body: any) {
    Logger.log(JSON.stringify(body))
    if (body.type == "customer.subscription.deleted") {
      Logger.log("Deleting subscription")
      return await this.subscriptionDeleted(body);
    }

    if (body.type == "invoice.paid") {
      Logger.log("Subscription payed, creating subscription")
      return await this.subscriptionCreate(body);
    }

    if (body.type == "customer.subscription.updated") {
      if (body.data.object.status == 'canceled') {
        Logger.log("Subscription cancelling")
        const user: User = await this.userService.getUser(body.data.object.metadata.userId);
        if (user.id == 2){
          Logger.log(`Admin user is not be able to unsubscribed`);
          throw new HttpException('El usuario admin no pueden desubscribirse', HttpStatus.BAD_REQUEST);
        }
        if (!(user.subscribed == true && user.subscription_id != null) || user.role == 'ADMIN') { // Puede ser cancelado por fraude, no por solicitud del usuario.
          Logger.log(`User not subscribed`);
          throw new HttpException('Usuario no subscrito', HttpStatus.BAD_REQUEST);
        }
    
        Logger.log(`Deleting subscription`);
        return this.webhookService.updateSubscription(user.id, "CANCELED", body.data.object.id);
      }
    }

    Logger.log(`Invalid event ${body.type}`);
  }

  async subscriptionDeleted(@Body() body: any) {
    if (body.type != "customer.subscription.deleted") {
      Logger.log(`Invalid event for ${body.type}`);
      throw new HttpException('Evento incorrecto', HttpStatus.BAD_REQUEST);
    }

    const user: User = await this.userService.getUser(body.data.object.metadata.userId);
    if (body.data.object.id != user.subscription_id) {
      Logger.log(`Invalid event for ${user}`)
      throw new HttpException('Evento incorrecto', HttpStatus.BAD_REQUEST);
    }
    if (user.id == 2){
      Logger.log(`Admin user is not be able to unsubscribed`);
      throw new HttpException('El usuario admin no pueden desubscribirse', HttpStatus.BAD_REQUEST);
    }
    if (!(user.subscribed == true && user.subscription_id != null) || user.role == 'ADMIN') { // Puede ser cancelado por fraude, no por solicitud del usuario.
      Logger.log(`User not subscribed`);
      throw new HttpException('Usuario no subscrito', HttpStatus.BAD_REQUEST);
    }

    Logger.log(`Deleting subscription`);
    return this.webhookService.updateSubscription(user.id, "CANCELED", body.data.object.id);
  }
  
  async subscriptionCreate(@Body() body: any) {
    if (body.type != "invoice.paid") {
      Logger.log(`Invalid event ${body.type}`);
      throw new HttpException('Evento incorrecto', HttpStatus.BAD_REQUEST);
    }

    const user: User = await this.userService.getUser(body.data.object.subscription_details.metadata.userId);
    if (user.id == 2){
      Logger.log(`Admin user is not be able to unsubscribed`);
      throw new HttpException('El usuario de admin no pueden subscribirse', HttpStatus.BAD_REQUEST);
    }
    if (!(user.subscribed == false && user.subscription_id == null && user.cancellation_pending == false) || user.role == 'ADMIN') {
      Logger.log(`User subscribed`);
      // throw new HttpException('Usuario subscrito', HttpStatus.BAD_REQUEST);
    }

    Logger.log(`Creating subscription`);
    console.log(body)
    return this.webhookService.updateSubscription(user.id, "CREATED", body.data.object.subscription);
  }
}
