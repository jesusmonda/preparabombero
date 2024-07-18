import { Controller, BadRequestException, Put, Query, Get, Delete, HttpException, HttpStatus, Param, Post, Body, UseGuards } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto'
import { CheckQuizzesDto } from './dto/check-quizzes.dto'
import { QuizOmitResult, QuizAndStatus } from 'src/common/interfaces/quiz.interface';
import { Quiz } from '@prisma/client';
import { UserGuard } from 'src/common/guards/user.guard';
import { QuizDto } from './dto/quiz.dto'
import { AdminGuard } from 'src/common/guards/admin.guard';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('generate')
  @UseGuards(UserGuard)
  async generateQuiz(@Body() generateQuizDto: GenerateQuizDto) {
    let topicIds: number[] = generateQuizDto.topicIds;
    let response: QuizOmitResult[] = await this.quizService.getQuizzesFromTopicIds(topicIds);

    // TODO
    // Chequear si está subscrito

    return response;
  }

  @Post('check')
  @UseGuards(UserGuard)
  async checkQuiz(@Body() checkQuizzesDto: CheckQuizzesDto) {
    let fail: number = 0;
    let success: number = 0;
    let response: QuizAndStatus[] = [];

    const promises = checkQuizzesDto.quizzes.map(async x => {
      let quiz: Quiz = await this.quizService.findQuiz(x.quizId)
      let status;
      if (quiz.result == x.optionSelected) {
        success++;
        status = "success"
      }else{
        fail++;
        status = "fail"
      };
      response.push({... quiz, status})
    });
    await Promise.all(promises);

    return {success, fail, quizzes: response}
  }

  @Get('')
  @UseGuards(AdminGuard)
  async getByTopicId(@Query('topicId') topicId: string) {
    if (!topicId || topicId == '') {
      throw new BadRequestException();
    }
    const topicIdNumber: number = Number(topicId)
    if (isNaN(topicIdNumber)) {
      throw new BadRequestException();
    }

    let quiz: QuizOmitResult[] = await this.quizService.getQuizzesFromTopicIds([topicIdNumber])
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
