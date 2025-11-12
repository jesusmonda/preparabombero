import { Controller, Request, BadRequestException, Put, Query, Get, Delete, HttpException, HttpStatus, Param, Post, Body, UseGuards, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto'
import { CheckQuizzesDto } from './dto/check-quizzes.dto'
import { QuizOmitResult, QuizAndStatus } from 'src/common/interfaces/quiz.interface';
import { Quiz, User } from '@prisma/client';
import { OptionalUserGuard } from 'src/common/guards/optional-user.guard';
import { QuizDto } from './dto/quiz.dto'
import { AdminGuard } from 'src/common/guards/admin.guard';
import { UserService } from '../user/user.service';
import { UserGuard } from 'src/common/guards/user.guard';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService, private readonly userService: UserService) {}

  @UseGuards(OptionalUserGuard)
  @Post('generate')
  async generateQuizTopic(@Body() generateQuizDto: GenerateQuizDto, @Request() request: Request) {

    if (generateQuizDto.topicIds && request['user']) {
      const user: User = await this.userService.getUser(request['user'].userId);

      let response: QuizOmitResult[] = await this.quizService.getQuizzesFromTopicIds(user.id, generateQuizDto.topicIds, "EXAM_TOPIC", "RANDOM");
      return response;
    } else if (generateQuizDto.pdfId) {
      let response: QuizOmitResult[] = await this.quizService.getQuizzesFromTopicIds(undefined, generateQuizDto.pdfId, "EXAM_PDF", "RANDOM");
      return response;
    } else {
      throw new UnauthorizedException();
    }
  }

  @UseGuards(OptionalUserGuard)
  @Post('check')
  async checkQuiz(@Body() checkQuizzesDto: CheckQuizzesDto, @Request() request: Request) {
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
      return {... quiz, status}
    });
    response = await Promise.all(promises);

    if (request['user']){
      const user: User = await this.userService.getUser(request['user'].userId);
      const subscribed = (user.subscribed == true && user.subscription_id != null);

      if (checkQuizzesDto.type == "EXAM") {
        await this.quizService.createStats(user.id, success, fail, not_answered);
      }

      if (!subscribed) {
        response.map(x => x.justification = null);
      }
    } else {
      response.map(x => x.justification = null);
    }

    return {success, fail, not_answered, quizzes: response}
  }

  @Get('')
  @UseGuards(AdminGuard)
  async getByTopicId(@Query('topicId') topicId: string, @Request() request: Request) {
    if (!topicId || topicId == '') {
      throw new HttpException('TopicId incorrecto', HttpStatus.BAD_REQUEST);
    }
    const topicIdNumber: number = Number(topicId)
    if (isNaN(topicIdNumber)) {
      throw new HttpException('TopicId incorrecto', HttpStatus.BAD_REQUEST);
    }
    const user: User = await this.userService.getUser(request['user'].userId);

    let quiz: QuizOmitResult[] = await this.quizService.getQuizzesFromTopicIds(user.id, topicIdNumber, "LIST", "DESC")
    return quiz;
  }
  
  @Post('')
  @UseGuards(AdminGuard)
  async create(@Body() quizDto: QuizDto) {
    return await this.quizService.create(quizDto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async update(@Param('id') quizId: string, @Body() quizDto: QuizDto) {
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

    return await this.quizService.update(quizIdNumber, quizDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async delete(@Param('id') quizId: string) {
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

    return await this.quizService.delete(quizIdNumber);
  }

  // Favorite
  @Get('favorite')
  @UseGuards(UserGuard)
  async getFavoriteQuiz(@Request() request: Request) {
    const user: User = await this.userService.getUser(request['user'].userId);
    const subscribed = (user.subscribed == true && user.subscription_id != null);
    if (!subscribed) {
      throw new UnauthorizedException();
    }

    let quiz: QuizOmitResult[] = await this.quizService.getFavoriteQuiz(user.id)
    return quiz;
  }
  
  @Post('favorite')
  @UseGuards(UserGuard)
  async createFavoriteQuiz(@Body() quiz: {quizId: number}, @Request() request: Request) {
    const user: User = await this.userService.getUser(request['user'].userId);

    return await this.quizService.createFavoriteQuiz(user.id, quiz.quizId);
  }

  @Delete(':id/favorite')
  @UseGuards(UserGuard)
  async deleteFavoriteQuiz(@Param('id') quizId: string, @Request() request: Request) {
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

    const user: User = await this.userService.getUser(request['user'].userId);

    return await this.quizService.deleteFavoriteQuiz(user.id, quizIdNumber);
  }
}
