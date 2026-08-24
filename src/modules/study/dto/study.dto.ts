import { IsNumber, IsString } from 'class-validator';

export class CreateStudyDto {
  @IsString({ message: 'validation.NOT_STRING' })
  community: string;

  @IsString({ message: 'validation.NOT_STRING' })
  city: string;

  @IsString({ message: 'validation.NOT_STRING' })
  type: string;

  @IsNumber({}, { message: 'validation.NOT_NUMBER' })
  estimateExamDate: number;
}

export class UpdateStudyDto {
  @IsNumber({}, { message: 'validation.NOT_NUMBER' })
  estimateExamDate: number;
}
