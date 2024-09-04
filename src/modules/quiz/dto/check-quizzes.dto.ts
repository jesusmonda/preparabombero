import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsOptional, IsInt, IsNotEmpty, IsString, ValidateNested, isEnum, IsEnum } from 'class-validator';

export enum CheckQuizType { EXAM = 'EXAM', REVIEW = 'REVIEW' }

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

    @IsNotEmpty({message: 'validation.NOT_EMPTY'})
    @IsEnum(CheckQuizType, {message: 'validation.NOT_ENUM'})
    type: string;
}