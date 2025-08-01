import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { NewCustomVocabularyItem } from "aws-sdk/clients/lexmodelsv2";
import { IsNumber, IsNumberString, IsOptional, Length } from "class-validator";

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
    blogId: number
}