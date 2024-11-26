import { Controller, UseInterceptors, Request, Headers, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException, HttpStatus, HttpException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { UserGuard } from 'src/common/guards/user.guard';
import { CacheInterceptor } from 'src/common/interceptors/cache.interceptor';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(UserGuard)
  @Post('subscription')
  async createSubscriptionLink(@Headers('Host') host: string, @Request() request: Request) {
    const user: User = await this.userService.getUser(request['user'].userId);

    if (user.id == 1 || user.id == 2){
      throw new HttpException('El usuario demo y admin no pueden subscribirse', HttpStatus.BAD_REQUEST);
    }
    if (!(user.subscribed == false && user.subscription_id == null && user.cancellation_pending == false) || user.role == 'ADMIN'){
      throw new HttpException('Usuario no subscrito', HttpStatus.BAD_REQUEST);
    }
    
    return this.userService.createSubscriptionLink(host, user.id);
  }

  @UseGuards(UserGuard)
  @Delete('subscription')
  async deleteSubscription(@Request() request: Request) {
    const user: User = await this.userService.getUser(request['user'].userId);

    if (user.id == 1 || user.id == 2){
      throw new HttpException('El usuario demo y admin no pueden desubscribirse', HttpStatus.BAD_REQUEST);
    }
    if (!(user.subscribed == true && user.subscription_id != null && user.cancellation_pending == false) || user.role == 'ADMIN'){
      throw new HttpException('Usuario no subscrito', HttpStatus.BAD_REQUEST);
    }
    
    this.userService.deleteSubscription(user.subscription_id, user.id);
  }

  @Get('')
  @UseGuards(UserGuard)
  @UseInterceptors(CacheInterceptor)
  async findOne(@Request() request: Request) {
    const user: User = await this.userService.getUser(request['user'].userId);
    delete user.password;
    delete user.role;
    delete user.subscription_id;
    return user;
  }

  @Get('stats')
  @UseGuards(UserGuard)
  @UseInterceptors(CacheInterceptor)
  async getStats(@Request() request: Request) {
    const user: User = await this.userService.getUser(request['user'].userId);
    const QuizStats = await this.userService.getQuizStats(user.id);
    return QuizStats;
  }
}
