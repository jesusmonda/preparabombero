import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ResetPasswordAuthDto {
    @IsNotEmpty({ message: 'validation.NOT_EMPTY' })
    @IsEmail({}, { message: 'validation.NOT_EMAIL_VALID' })
    email: string;
}
