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

  @Get('configuration')
  @UseGuards(UserGuard)
  getConfiguration() {
    return this.packService.getConfiguration();
  }

  @Get()
  @UseGuards(UserGuard)
  findAll(
    @Query('search') search: string,
    @Query('comunidad') comunidad: string,
    @Query('ciudad') ciudad: string,
    @Query('administracion') administracion: string,
    @Request() request: Request,
  ) {
    return this.packService.findAll(
      request['user'].userId,
      search,
      comunidad,
      ciudad,
      administracion,
    );
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
