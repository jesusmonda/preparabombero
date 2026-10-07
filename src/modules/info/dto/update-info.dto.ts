import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateInfoDto {
    @IsOptional()
    @IsNotEmpty({message: 'validation.NOT_EMPTY'})
    @IsString({message: 'validation.NOT_STRING'})
    title?: string;

    @IsOptional()
    @IsNotEmpty({message: 'validation.NOT_EMPTY'})
    @IsString({message: 'validation.NOT_STRING'})
    description?: string;

    @IsOptional()
    @IsObject()
    announcementData?: Record<string, unknown>;
}
