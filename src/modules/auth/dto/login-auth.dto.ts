import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginAuthDto {
    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsEmail({}, { message: 'validation.NOT_EMAIL_VALID' })
    email: string;
  
    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsString({ message: 'validation.NOT_STRING' })
    password: string;
}
