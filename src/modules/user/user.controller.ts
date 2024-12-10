import { Controller, Request, Headers, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException, HttpStatus, HttpException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { UserGuard } from 'src/common/guards/user.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(UserGuard)
  @Post('subscription')
  async createSubscriptionLink(@Headers('Origin') origin: string, @Request() request: Request) {
    const user: User = await this.userService.getUser(request['user'].userId);

    if (user.id == 2){
      throw new HttpException('El usuario admin no pueden subscribirse', HttpStatus.BAD_REQUEST);
    }
    if (!(user.subscribed == false && user.subscription_id == null && user.cancellation_pending == false) || user.role == 'ADMIN'){
      throw new HttpException('Usuario no subscrito', HttpStatus.BAD_REQUEST);
    }
    
    return this.userService.createSubscriptionLink(origin, user.id);
  }

  @UseGuards(UserGuard)
  @Delete('subscription')
  async deleteSubscription(@Request() request: Request) {
    const user: User = await this.userService.getUser(request['user'].userId);

    if (user.id == 2){
      throw new HttpException('El usuario admin no pueden desubscribirse', HttpStatus.BAD_REQUEST);
    }
    if (!(user.subscribed == true && user.subscription_id != null && user.cancellation_pending == false) || user.role == 'ADMIN'){
      throw new HttpException('Usuario no subscrito', HttpStatus.BAD_REQUEST);
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

  @Get('stats')
  @UseGuards(UserGuard)
  async getStats(@Request() request: Request) {
    const user: User = await this.userService.getUser(request['user'].userId);
    const QuizStats = await this.userService.getQuizStats(user.id);
    return QuizStats;
  }
}
