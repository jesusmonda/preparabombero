import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateInfoDto {
    @IsNotEmpty({message: 'validation.NOT_EMPTY'})
    @IsString({message: 'validation.NOT_STRING'})
    title: string;

    @IsNotEmpty({message: 'validation.NOT_EMPTY'})
    @IsString({message: 'validation.NOT_STRING'})
    description: string;
}