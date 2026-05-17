import { ArrayNotEmpty, IsInt, IsNotEmpty, IsNumber, Max, Min, ValidateIf } from 'class-validator';

export class GenerateQuizDto {
    @ValidateIf(o => !o.pdfId)
    @ArrayNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsNumber({}, { each: true, message: 'validation.NOT_NUMBER' })
    topicIds: number[];

    @ValidateIf(o => !o.topicIds)
    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsNumber({}, { message: 'validation.NOT_NUMBER' })
    pdfId: number;

    @ValidateIf(o => o.topicIds)
    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsInt({ message: 'validation.NOT_NUMBER' })
    @Min(0, { message: 'validation.MIN' })
    @Max(200, { message: 'validation.MAX' })
    numberOfQuestions: number;
}
