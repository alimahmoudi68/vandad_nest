import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class UserMigration1678901234567 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name : "users" ,
                columns:[
                    {name : "id" ,  type : "int" , isPrimary: true , isNullable : false , isGenerated : true , generationStrategy : "increment"},
                    {name : "firstName" , type : "varchar(30)" , isNullable : true},
                    {name : "lastName" , type : "varchar(30)" , isNullable : true},
                    {name : "phone" , type : "varchar(11)" , isUnique : true , isNullable : true},
                    {name : "about" , type : "varchar(200)" , isNullable : true},
                    //{name:"enumExample" , type : "enum" , enum : ["enum1" , "enum2"]} ,
                    {name : "active" , type : "boolean" , default : false },
                    {name : "isAdmin" , type : "boolean" , default : false },
                    {name: "created_at" , type : "timestamp" , default : "CURRENT_TIMESTAMP"},
                    {name : "updated_at" , type : "timestamp" , default: "CURRENT_TIMESTAMP"}
                ]
            }) ,
            true
        )


        // اضافه کردن ستون
        // let balance = await queryRunner.hasColumn("users" , "balance");
        // if(!balance){
        //     //@ts-ignore
        //     await queryRunner.addColumn("users" , new TableColumn({
        //         name : "balance" ,
        //         type : "numeric" ,
        //         default : 0,
        //         isNullable : false
        //     }));
        // }

        // ویرایش یک ستون
        // let userName = await queryRunner.hasColumn("users" , "userName");
        // if(userName){
        //     //@ts-ignore
        //     await queryRunner.changeColumn("users" , "userName" , new TableColumn({
        //         name : "userName" ,
        //         isNullable : false,
        //         type : "varchar(300)"
        //     }));
        // }
      
    }

    
    public async down(queryRunner: QueryRunner): Promise<void> {
        //await  queryRunner.dropColumn("users" , "balance")
        await queryRunner.dropTable("users" , true);
    }

}
