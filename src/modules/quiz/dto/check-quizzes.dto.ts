import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsInt, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

class checkQuizDto {
    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsInt({ message: 'validation.NOT_NUMBER' })
    quizId: number;

    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsString({ message: 'validation.NOT_STRING' })
    optionSelected: string;
}

export class checkQuizzesDto {
    @ArrayNotEmpty({ message: 'validation.NOT_EMPTY' })
    @ValidateNested({ each: true, message: 'validation.NOT_TYPE' })
    @Type(() => checkQuizDto)
    quizzes: checkQuizDto[];
}
