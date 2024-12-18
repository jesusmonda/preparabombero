import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterAuthDto {
    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsEmail({}, { message: 'validation.NOT_EMAIL_VALID' })
    email: string;
  
    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsString({ message: 'validation.NOT_STRING' })
    name: string;

    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsString({ message: 'validation.NOT_STRING' })
    surname: string;

    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsString({ message: 'validation.NOT_STRING' })
    password: string;

    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsString({ message: 'validation.NOT_STRING' })
    repeatPassword: string;
}
