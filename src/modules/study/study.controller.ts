import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserGuard } from 'src/common/guards/user.guard';
import { PrismaService } from 'src/common/services/database.service';
import { CreateStudyDto } from './dto/study.dto';
import { StudyService } from './study.service';

@Controller('study')
export class StudyController {
  constructor(
    private readonly studyService: StudyService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('configuration')
  @UseGuards(UserGuard)
  async findConfiguration(@Request() request: Request) {
    await this.validateSubscription(request['user'].userId);
    return this.studyService.findConfiguration();
  }

  @Get()
  @UseGuards(UserGuard)
  async findAll(@Request() request: Request) {
    await this.validateSubscription(request['user'].userId);
    return this.studyService.findAll(request['user'].userId);
  }

  @Get(':id')
  @UseGuards(UserGuard)
  async findQuizzes(@Param('id') id, @Request() request: Request) {
    await this.validateSubscription(request['user'].userId);
    return this.studyService.findQuizzes(request['user'].userId, id);
  }

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(UserGuard)
  async create(@Body() dto: CreateStudyDto, @Request() request: Request) {
    await this.validateSubscription(request['user'].userId);
    return this.studyService.create(request['user'].userId, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(UserGuard)
  async delete(@Request() request: Request) {
    await this.validateSubscription(request['user'].userId);
    return this.studyService.delete(request['user'].userId);
  }

  private async validateSubscription(userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscribed: true, subscription_id: true },
    });

    if (!user?.subscribed || !user.subscription_id) {
      throw new ForbiddenException('Necesitas una suscripción activa');
    }
  }
}
