import {
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserGuard } from 'src/common/guards/user.guard';
import { PackService } from './pack.service';

@Controller('pack')
export class PackController {
  constructor(private readonly packService: PackService) {}

  @Get()
  @UseGuards(UserGuard)
  findAll(@Query('search') search: string, @Request() request: Request) {
    return this.packService.findAll(request['user'].userId, search);
  }

  @Get(':id/questions')
  @UseGuards(UserGuard)
  getPurchasedQuestions(
    @Param('id', ParseIntPipe) id: number,
    @Request() request: Request,
  ) {
    return this.packService.getPurchasedQuestions(
      request['user'].userId,
      id,
    );
  }

  @Post(':id/checkout')
  @UseGuards(UserGuard)
  createCheckout(
    @Param('id', ParseIntPipe) id: number,
    @Headers('Origin') origin: string,
    @Request() request: Request,
  ) {
    return this.packService.createCheckoutSession(
      request['user'].userId,
      id,
      origin,
    );
  }
}
