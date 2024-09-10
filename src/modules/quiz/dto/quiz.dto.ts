import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class QuizDto {
    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsString({message: 'validation.NOT_STRING'})
    title: string;

    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsString({message: 'validation.NOT_STRING'})
    option1: string;

    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsString({message: 'validation.NOT_STRING'})
    option2: string;

    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsString({message: 'validation.NOT_STRING'})
    option3: string;

    @IsString({message: 'validation.NOT_STRING'})
    option4: string;

    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsString({message: 'validation.NOT_STRING'})
    result: string;

    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsNumber({}, {message: 'validation.NOT_NUMBER'})
    topicId: number;

    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsString({message: 'validation.NOT_STRING'})
    justification: string;
}
