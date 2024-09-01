import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';

@Controller('webhook')
export class WebhookController {
  constructor(private userService: UserService, private readonly webhookService: WebhookService) {}

  @Post('subscription/canceled')
  async subscriptionDeleted(@Body() body: any) {
    if (body.type != "customer.subscription.deleted") {
      throw new BadRequestException();
    }
      
    const user: User = await this.userService.getUser(body.data.object.metadata.userId);
    if (user.id == 1 || user.id == 2){
      throw new BadRequestException();
    }
    if (!(user.subscribed == true && user.subscription_id != null) || user.role == 'ADMIN') { // Puede ser cancelado por fraude, no por solicitud del usuario.
      throw new BadRequestException();
    }

    try {
    	return this.webhookService.updateSubscription(user.id, "CANCELED", body.data.object.id);
    } catch (error) {
        console.log(error);
        throw new InternalServerErrorException();
    }
  }
  
  @Post('subscription/created')
  async subscriptionCreate(@Body() body: any) {
    if (body.type != "customer.subscription.created") {
      throw new BadRequestException();
    }

    const user: User = await this.userService.getUser(body.data.object.metadata.userId);
    if (user.id == 1 || user.id == 2){
      throw new BadRequestException();
    }
    if (!(user.subscribed == false && user.subscription_id == null && user.cancellation_pending == false) || user.role == 'ADMIN') {
      throw new BadRequestException();
    }

    try {
    	return this.webhookService.updateSubscription(user.id, "CREATED", body.data.object.id);
    } catch (error) {
        console.log(error);
        throw new InternalServerErrorException();
    }
  }
}
