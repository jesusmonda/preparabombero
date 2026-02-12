import { IsInt, IsNotEmpty } from 'class-validator';

export class QuizStatsDto {
  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @IsInt({ message: 'validation.NOT_NUMBER' })
  correct: number;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @IsInt({ message: 'validation.NOT_NUMBER' })
  wrong: number;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @IsInt({ message: 'validation.NOT_NUMBER' })
  answered: number;

  @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
  @IsInt({ message: 'validation.NOT_NUMBER' })
  unanswered: number;
}
