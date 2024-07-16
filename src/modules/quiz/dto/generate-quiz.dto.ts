import { ArrayNotEmpty, IsNotEmpty, IsNumber } from 'class-validator';

export class generateQuizDto {
    @ArrayNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsNumber({}, {each: true, message: 'validation.NOT_NUMBER'})
    topicIds: number[];
}
