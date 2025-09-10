import { IsInt, IsNotEmpty, IsNumber } from "class-validator";


export class BookmarkDto{
    @IsNotEmpty({message : "شناسه محصول نمی تواند خالی باشذ"})
    @IsNumber({},{message : "شناسه محصول باید یک عدد باشد"})
    @IsInt({message : "شناسه محصول باید یک عدد صحیح باشد"})
    product_id : number
}