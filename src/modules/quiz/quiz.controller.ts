import { Controller, Post, Body } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { generateQuizDto } from './dto/generate-quiz.dto'
import { checkQuizzesDto } from './dto/check-quizzes.dto'
import { QuizOmitResult } from 'src/common/interfaces/quiz.interface';
import { Quiz } from '@prisma/client';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('')
  async generateQuiz(@Body() generateQuizDto: generateQuizDto) {
    let topicIds: number[] = generateQuizDto.topicIds;
    let response: QuizOmitResult[] = await this.quizService.getQuizFromTopicId(topicIds);

    return response;
  }

  @Post('check')
  async checkQuiz(@Body() checkQuizzesDto: checkQuizzesDto) {
    let fail: number = 0;
    let success: number = 0;
    let response: (Quiz & {status: string})[] = [];

    const promises = checkQuizzesDto.quizzes.map(async x => {
      let quiz: Quiz & {status?: string} = await this.quizService.getQuiz(x.quizId)
      if (quiz.result == x.optionSelected) {
        success = success + 1;
        quiz.status = "success"
      }else{
        fail++;
        quiz.status = "fail"
      };
      response.push(quiz as Quiz & {status: string})
    });
    await Promise.all(promises);

    return {success, fail, quizzes: response}
  }
}
