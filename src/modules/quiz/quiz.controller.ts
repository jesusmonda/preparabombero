import { Controller, Request, BadRequestException, Put, Query, Get, Delete, HttpException, HttpStatus, Param, Post, Body, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto'
import { CheckQuizzesDto } from './dto/check-quizzes.dto'
import { QuizOmitResult, QuizAndStatus } from 'src/common/interfaces/quiz.interface';
import { Quiz, User } from '@prisma/client';
import { UserGuard } from 'src/common/guards/user.guard';
import { QuizDto } from './dto/quiz.dto'
import { AdminGuard } from 'src/common/guards/admin.guard';
import { UserService } from '../user/user.service';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService, private readonly userService: UserService) {}

  @Post('generate')
  @UseGuards(UserGuard)
  async generateQuiz(@Body() generateQuizDto: GenerateQuizDto, @Request() request: Request) {
    const user: User = await this.userService.getUser(request['user'].userId);
    if (!(user.subscribed == true && user.subscription_id != null) && !(user.role == "ADMIN")) {
      throw new BadRequestException();
    }
    if (generateQuizDto.topicIds.length <= 0) {
      throw new BadRequestException();
    }

    let topicIds: number[] = generateQuizDto.topicIds;
    let response: QuizOmitResult[] = await this.quizService.getQuizzesFromTopicIds(user.id, topicIds, "RANDOM");

    return response;
  }

  @Post('check')
  @UseGuards(UserGuard)
  async checkQuiz(@Body() checkQuizzesDto: CheckQuizzesDto, @Request() request: Request) {
    const user: User = await this.userService.getUser(request['user'].userId);
    if (!(user.subscribed == true && user.subscription_id != null) && !(user.role == "ADMIN")) {
      throw new BadRequestException();
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

    return {success, fail, not_answered, quizzes: response}
  }

  @Get('')
  @UseGuards(AdminGuard)
  async getByTopicId(@Query('topicId') topicId: string, @Request() request: Request) {
    if (!topicId || topicId == '') {
      throw new BadRequestException();
    }
    const topicIdNumber: number = Number(topicId)
    if (isNaN(topicIdNumber)) {
      throw new BadRequestException();
    }
    const user: User = await this.userService.getUser(request['user'].userId);

    let quiz: QuizOmitResult[] = await this.quizService.getQuizzesFromTopicIds(user.id, [topicIdNumber], "DESC")
    return quiz;
  }
  
  @Post('')
  @UseGuards(AdminGuard)
  async create(@Body() quizDto: QuizDto) {
    const quiz = await this.quizService.findQuizByTitle(quizDto.title);
    if (quiz != null) {
      throw new BadRequestException();
    }

    return await this.quizService.create(quizDto);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async update(@Param('id') quizId: string, @Body() quizDto: QuizDto) {
    if (!quizId || quizId == '') {
      throw new BadRequestException();
    }
    const quizIdNumber: number = Number(quizId)
    if (isNaN(quizIdNumber)) {
      throw new BadRequestException();
    }

    let quiz: Quiz = await this.quizService.findQuiz(quizIdNumber);
    if (quiz == null) {
      throw new HttpException('Not found quiz', HttpStatus.NOT_FOUND);
    }

    return await this.quizService.update(quizIdNumber, quizDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async delete(@Param('id') quizId: string) {
    if (!quizId || quizId == '') {
      throw new BadRequestException();
    }
    const quizIdNumber: number = Number(quizId)
    if (isNaN(quizIdNumber)) {
      throw new BadRequestException();
    }
  
    let quiz: Quiz = await this.quizService.findQuiz(quizIdNumber);
    if (quiz == null) {
      throw new HttpException('Not found quiz', HttpStatus.NOT_FOUND);
    }

    return await this.quizService.delete(quizIdNumber);
  }
}
