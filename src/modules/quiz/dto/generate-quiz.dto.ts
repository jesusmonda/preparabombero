import { ArrayNotEmpty, IsNotEmpty, IsNumber, ValidateIf } from 'class-validator';

export class GenerateQuizDto {
    @ValidateIf(o => !o.pdfId)
    @ArrayNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsNumber({}, { each: true, message: 'validation.NOT_NUMBER' })
    topicIds: number[];

    @ValidateIf(o => !o.topicIds)
    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsNumber({}, { message: 'validation.NOT_NUMBER' })
    pdfId: number;
}
