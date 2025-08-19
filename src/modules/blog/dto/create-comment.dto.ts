import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, Length } from "class-validator";

export class CreateCommentDto{
    
    @ApiProperty({})
    @Length(1 , 500 , {message : "نظر باید بین ۱ تا ۵۰۰ کاراکتر باشد"})
    content: string

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    parentId: number

    @ApiProperty()
    @IsNumber()
    blogId: number
}