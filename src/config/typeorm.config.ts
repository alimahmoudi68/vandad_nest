import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export function TypeOrmConfig() : TypeOrmModuleOptions{
    const {
        DB_HOST ,
        DB_NAME ,
        DB_PASSWORD ,
        DB_PORT ,
        DB_USERNAME
    } = process.env ;

    //console.log('dir' , __dirname ) // پوشه کانفیگ را نشان می دهد
    return{
        type : "mysql" ,
        port : +DB_PORT ,
        host : DB_HOST , 
        username : DB_USERNAME  ,
        password : DB_PASSWORD ,
        database : DB_NAME ,
        synchronize : false ,
        autoLoadEntities : false ,
        entities : [__dirname + '/../**/**/**/*.entity{.ts,.js}'],
        // entities : [
        //     "dist/**/**/**/*.entity{.ts , .js}" ,
        //     "dist/**/**/*.entity{.ts , .js}"
        // ]
    }
}

// import { Injectable } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
// import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

// @Injectable()
// export class TypeOrmDbConfig implements TypeOrmOptionsFactory{

//     constructor(private configservice : ConfigService){}

//     createTypeOrmOptions(connectionName?: string): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
//         return {
//             type : "postgres" ,
//             port : this.configservice.get("Db.port") ,
//             host : this.configservice.get("Db.host") ,
//             database : this.configservice.get("Db.database"),
//             username : this.configservice.get("Db.username") ,
//             password : this.configservice.get("Db.password") ,
//             synchronize : true ,
//             autoLoadEntities : false ,
//             entities : [
//                 "dist/**/**/**/*.entity{.ts , .js}" ,
//                 "dist/**/**/*.entity{.ts , .js}"
//             ]
//         }
//     }
    
// }