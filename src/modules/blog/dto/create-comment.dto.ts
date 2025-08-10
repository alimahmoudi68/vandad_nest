import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, Length } from "class-validator";

export class CreateCommentDto{
    
    @ApiProperty({})
    @Length(3 , 500 , {message : "نظر باید بین ۳ تا ۵۰۰ کاراکتر باشد"})
    content: string

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    parentId: number

    @ApiProperty()
    @IsNumber()
    blogId: number
}