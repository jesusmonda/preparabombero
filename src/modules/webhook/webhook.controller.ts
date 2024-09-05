import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';

@Controller('webhook')
export class WebhookController {
  constructor(private userService: UserService, private readonly webhookService: WebhookService) {}

  @Post('')
  async webhook(@Body() body: any) {
    if (body.type == "customer.subscription.deleted") {
      return await this.subscriptionDeleted(body);
    }

    if (body.type == "customer.subscription.created") {
      return await this.subscriptionCreate(body);
    }

    throw new HttpException('Evento incorrecto', HttpStatus.BAD_REQUEST);
  }

  async subscriptionDeleted(@Body() body: any) {
    if (body.type != "customer.subscription.deleted") {
      throw new HttpException('Evento incorrecto', HttpStatus.BAD_REQUEST);
    }
      
    const user: User = await this.userService.getUser(body.data.object.metadata.userId);
    if (user.id == 1 || user.id == 2){
      throw new HttpException('El usuario demo y admin no pueden desubscribirse', HttpStatus.BAD_REQUEST);
    }
    if (!(user.subscribed == true && user.subscription_id != null) || user.role == 'ADMIN') { // Puede ser cancelado por fraude, no por solicitud del usuario.
      throw new HttpException('Usuario no subscrito', HttpStatus.BAD_REQUEST);
    }

    	return this.webhookService.updateSubscription(user.id, "CANCELED", body.data.object.id);
  }
  
  async subscriptionCreate(@Body() body: any) {
    if (body.type != "customer.subscription.created") {
      throw new HttpException('Evento incorrecto', HttpStatus.BAD_REQUEST);
    }

    const user: User = await this.userService.getUser(body.data.object.metadata.userId);
    if (user.id == 1 || user.id == 2){
      throw new HttpException('El usuario de demo y admin no pueden subscribirse', HttpStatus.BAD_REQUEST);
    }
    if (!(user.subscribed == false && user.subscription_id == null && user.cancellation_pending == false) || user.role == 'ADMIN') {
      throw new HttpException('Usuario no subscrito', HttpStatus.BAD_REQUEST);
    }

    	return this.webhookService.updateSubscription(user.id, "CREATED", body.data.object.id);
  }
}
