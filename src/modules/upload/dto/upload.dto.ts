import { ApiProperty } from "@nestjs/swagger";

export class UploadDto {
    @ApiProperty({format: "binary"})
    file: string
}
