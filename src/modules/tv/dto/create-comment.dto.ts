import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {  IsNumberString, IsOptional, Length } from "class-validator";

export class CreateCommentDto{
    
    @ApiProperty({})
    @Length(3 , 500 , {message : "نظر باید بین ۳ تا ۵۰۰ کاراکتر باشد"})
    content: string

    @ApiPropertyOptional()
    @IsNumberString()
    @IsOptional()
    parentId: number

    @ApiProperty()
    @IsNumberString()
    tvId: number
}