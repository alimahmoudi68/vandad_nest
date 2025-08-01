import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SecuritySchemeObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export function SwaggerConfigInit(app : INestApplication) : void{

    const document = new DocumentBuilder()
    .setTitle("Shop")
    .setDescription("my online shop")
    .setVersion("v0.0.1")
    .addServer('/api/v1') // این خط مهم است!
    .addBearerAuth(SwaggerAuthConfig() , "Authorization")
    .build();

    const swaggerDocument = SwaggerModule.createDocument(app , document);
    SwaggerModule.setup("/api-docs" , app , swaggerDocument);
    
}

function SwaggerAuthConfig(): SecuritySchemeObject{
    return{
        type: "http",
        bearerFormat: "JWT",
        in: "header",
        scheme: "bearer"
    }
}