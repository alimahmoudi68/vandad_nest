import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class UploadDto {
    @ApiProperty()
    @Expose()
    id: number;

    @ApiProperty()
    @Expose()
    title: string;

    @ApiProperty()
    @Expose()
    bucket: string;

    @ApiProperty()
    @Expose()
    location: string;

    @ApiProperty()
    @Expose()
    alt: string;

    @ApiProperty()
    @Expose()
    created_at: Date;
}
