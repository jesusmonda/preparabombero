import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RecoveryPasswordAuthDto {
    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsString({ message: 'validation.NOT_STRING' })
    token: string;

    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsString({ message: 'validation.NOT_STRING' })
    password: string;

    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsString({ message: 'validation.NOT_STRING' })
    repeatPassword: string;
}
