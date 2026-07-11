import { IsNotEmpty, ValidateIf, IsEnum, IsNumber, IsOptional, IsString, IsUrl } from "class-validator";

export enum TopicType { PRIMARY = 'PRIMARY', SECONDARY = 'SECONDARY' }

export class CreateTopicDto {
    @IsNotEmpty({message: 'validation.NOT_EMPTY'})
    @IsString({message: 'validation.NOT_STRING'})
    title: string;

    @IsOptional()
    @IsUrl({}, {message: 'validation.NOT_URL'})
    url?: string;

    @ValidateIf(x => x.type === TopicType.PRIMARY)
    @IsNotEmpty({message: 'validation.NOT_EMPTY'})
    @IsString({message: 'validation.NOT_STRING'})
    categoryTitle: string;

    @ValidateIf(x => x.type === TopicType.SECONDARY)
    @IsNotEmpty({message: 'validation.NOT_EMPTY'})
    @IsNumber({}, {message: 'validation.NOT_NUMBER'})
    parentId: number;

    @IsNotEmpty({message: 'validation.NOT_EMPTY'})
    @IsEnum(TopicType, {message: 'validation.NOT_ENUM'})
    type: string;

    order: number;
}
