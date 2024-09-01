import { Controller, Request, Headers, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { UserGuard } from 'src/common/guards/user.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(UserGuard)
  @Post('subscription')
  async createSubscriptionLink(@Headers('Host') host: string, @Request() request: Request) {
    const user: User = await this.userService.getUser(request['user'].userId);

    if (user.id == 1 || user.id == 2){
      throw new BadRequestException();
    }
    if (!(user.subscribed == false && user.subscription_id == null && user.cancellation_pending == false) || user.role == 'ADMIN'){
      throw new BadRequestException();
    }
    
    return this.userService.createSubscriptionLink(host, user.id);
  }

  @UseGuards(UserGuard)
  @Delete('subscription')
  async deleteSubscription(@Request() request: Request) {
    const user: User = await this.userService.getUser(request['user'].userId);

    if (user.id == 1 || user.id == 2){
      throw new BadRequestException();
    }
    if (!(user.subscribed == true && user.subscription_id != null && user.cancellation_pending == false) || user.role == 'ADMIN'){
      throw new BadRequestException();
    }
    
    this.userService.deleteSubscription(user.subscription_id, user.id);
  }

  @UseGuards(UserGuard)
  @Get('')
  async findOne(@Request() request: Request) {
    const user: User = await this.userService.getUser(request['user'].userId);
    delete user.password;
    delete user.role;
    delete user.subscription_id;
    return user;
  }
}
