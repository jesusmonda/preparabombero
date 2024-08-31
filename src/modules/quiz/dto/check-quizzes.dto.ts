import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsOptional, IsInt, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

class checkQuiz {
    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsInt({ message: 'validation.NOT_NUMBER' })
    quizId: number;

    @IsOptional()
    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsString({ message: 'validation.NOT_STRING' })
    optionSelected: string;
}

export class CheckQuizzesDto {
    @ArrayNotEmpty({ message: 'validation.NOT_EMPTY' })
    @ValidateNested({ each: true, message: 'validation.NOT_TYPE' })
    @Type(() => checkQuiz)
    quizzes: checkQuiz[];
}