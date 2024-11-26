import { Controller, Inject, UseInterceptors, Request, BadRequestException, Put, Query, Get, Delete, HttpException, HttpStatus, Param, Post, Body, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto'
import { CheckQuizzesDto } from './dto/check-quizzes.dto'
import { QuizOmitResult, QuizAndStatus } from 'src/common/interfaces/quiz.interface';
import { Quiz, User } from '@prisma/client';
import { UserGuard } from 'src/common/guards/user.guard';
import { QuizDto } from './dto/quiz.dto'
import { AdminGuard } from 'src/common/guards/admin.guard';
import { UserService } from '../user/user.service';
import { CacheInterceptor } from 'src/common/interceptors/cache.interceptor';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Controller('quiz')
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @Post('generate')
  @UseGuards(UserGuard)
  async generateQuiz(@Body() generateQuizDto: GenerateQuizDto, @Request() request: Request) {
    const user: User = await this.userService.getUser(request['user'].userId);
    if (!(user.subscribed == true && user.subscription_id != null) && !(user.role == "ADMIN")) {
      throw new HttpException('Usuario no subscrito', HttpStatus.BAD_REQUEST);
    }
    if (generateQuizDto.topicIds.length <= 0) {
      throw new HttpException('No se ha encontrado preguntas', HttpStatus.BAD_REQUEST);
    }

    let topicIds: number[] = generateQuizDto.topicIds;
    let response: QuizOmitResult[] = await this.quizService.getQuizzesFromTopicIds(user.id, topicIds, "RANDOM");

    return response;
  }

  @Post('check')
  @UseGuards(UserGuard)
  @UseInterceptors(CacheInterceptor)
  async checkQuiz(@Body() checkQuizzesDto: CheckQuizzesDto, @Request() request) {
    const user: User = await this.userService.getUser(request['user'].userId);
    if (!(user.subscribed == true && user.subscription_id != null) && !(user.role == "ADMIN")) {
      throw new HttpException('Usuario no subscrito', HttpStatus.BAD_REQUEST);
    }

    let fail: number = 0;
    let success: number = 0;
    let not_answered: number = 0;
    let response: QuizAndStatus[] = [];

    const promises = checkQuizzesDto.quizzes.map(async x => {
      let quiz: Quiz = await this.quizService.findQuiz(x.quizId)
      let status;
      if (quiz.result == x.optionSelected) {
        success++;
        status = "success"
      }else if (x.optionSelected == null) {
        not_answered++;
        status = "not_answered"
      } else{
        fail++;
        status = "fail"
      };
      response.push({... quiz, status})
      return response;
    });
    await Promise.all(promises);

    if (checkQuizzesDto.type == "EXAM") {
      await this.quizService.createStats(user.id, success, fail, not_answered);
    }

    const res: {success: number, fail: Number, not_answered: Number, quizzes: QuizAndStatus[]} = {success, fail, not_answered, quizzes: response};
  
    return res;
  }

  @Get('')
  @UseGuards(AdminGuard)
  @UseInterceptors(CacheInterceptor)
  async getByTopicId(@Query('topicId') topicId: string, @Request() request) {
    if (!topicId || topicId == '') {
      throw new HttpException('TopicId incorrecto', HttpStatus.BAD_REQUEST);
    }
    const topicIdNumber: number = Number(topicId)
    if (isNaN(topicIdNumber)) {
      throw new HttpException('TopicId incorrecto', HttpStatus.BAD_REQUEST);
    }
    const user: User = await this.userService.getUser(request['user'].userId);

    let quiz: QuizOmitResult[] = await this.quizService.getQuizzesFromTopicIds(user.id, [topicIdNumber], "DESC")
    return quiz;
  }
  
  @Post('')
  @UseGuards(AdminGuard)
  async create(@Body() quizDto: QuizDto, @Request() request) {
    const quiz = await this.quizService.findQuizByTitle(quizDto.title);
    if (quiz != null) {
      throw new HttpException('Ya existe una pregunta con el mismo titulo', HttpStatus.BAD_REQUEST);
    }

    const response = await this.quizService.create(quizDto);

    console.log(`userId:${request['user'].userId}:endpoint:/quiz/check delete cache`)
    await this.cacheManager.del(`userId:${request['user'].userId}:endpoint:/quiz/check`);
    console.log(`userId:${request['user'].userId}:endpoint:/quiz delete cache`)
    await this.cacheManager.del(`userId:${request['user'].userId}:endpoint:/quiz`);

    return response;
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async update(@Param('id') quizId: string, @Body() quizDto: QuizDto, @Request() request) {
    if (!quizId || quizId == '') {
      throw new HttpException('quizId incorrecto', HttpStatus.BAD_REQUEST);
    }
    const quizIdNumber: number = Number(quizId)
    if (isNaN(quizIdNumber)) {
      throw new HttpException('quizId incorrecto', HttpStatus.BAD_REQUEST);
    }

    let quiz: Quiz = await this.quizService.findQuiz(quizIdNumber);
    if (quiz == null) {
      throw new HttpException('Pregunta no encontrada', HttpStatus.NOT_FOUND);
    }

    console.log(`userId:${request['user'].userId}:endpoint:/quiz/check delete cache`)
    await this.cacheManager.del(`userId:${request['user'].userId}:endpoint:/quiz/check`);
    console.log(`userId:${request['user'].userId}:endpoint:/quiz delete cache`)
    await this.cacheManager.del(`userId:${request['user'].userId}:endpoint:/quiz`);

    return await this.quizService.update(quizIdNumber, quizDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async delete(@Param('id') quizId: string, @Request() request) {
    if (!quizId || quizId == '') {
      throw new HttpException('quizId incorrecto', HttpStatus.BAD_REQUEST);
    }
    const quizIdNumber: number = Number(quizId)
    if (isNaN(quizIdNumber)) {
      throw new HttpException('quizId incorrecto', HttpStatus.BAD_REQUEST);
    }
  
    let quiz: Quiz = await this.quizService.findQuiz(quizIdNumber);
    if (quiz == null) {
      throw new HttpException('Pregunta no encontrada', HttpStatus.NOT_FOUND);
    }

    const response = await this.quizService.delete(quizIdNumber);

    console.log(`userId:${request['user'].userId}:endpoint:/quiz/check delete cache`)
    await this.cacheManager.del(`userId:${request['user'].userId}:endpoint:/quiz/check`);
    console.log(`userId:${request['user'].userId}:endpoint:/quiz delete cache`)
    await this.cacheManager.del(`userId:${request['user'].userId}:endpoint:/quiz`);

    return response;
  }
}
