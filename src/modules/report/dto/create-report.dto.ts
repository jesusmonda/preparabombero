import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateReportDto {
    @IsNotEmpty({message: 'validation.NOT_EMPTY'})
    @IsNumber({}, {message: 'validation.NOT_NUMBER'})
    quizId: number;

    @IsNotEmpty({message: 'validation.NOT_EMPTY'})
    @IsString({message: 'validation.NOT_STRING'})
    reason: string;
}
