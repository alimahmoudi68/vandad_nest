import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";

export function FilterBlog(){
    return applyDecorators(
        ApiQuery({name: "q" , required : false}),
        ApiQuery({name: "cat" , required : false}),
    )



}