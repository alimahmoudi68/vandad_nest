import { DataSource } from "typeorm";
import { config } from 'dotenv';

config();

const {
    DB_HOST ,
    DB_NAME ,
    DB_PASSWORD ,
    DB_PORT ,
    DB_USERNAME
} = process.env ;


let dataSouce = new DataSource({
    type: 'mysql',
    host: DB_HOST,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: +DB_PORT,
    synchronize: true,
    entities : [
        "dist/**/**/**/*.entity{.ts,.js}" ,
        "dist/**/**/*.entity{.ts,.js}" ,
    ],
    migrations : [
        "src/migrations/*{.ts,.js}"
    ],
    migrationsTableName: "my_migration"
});

export default dataSouce;