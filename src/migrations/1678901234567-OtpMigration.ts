import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class OtpMigration1678901234567 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name : "otp" ,
                columns:[
                    {name : "id" ,  type : "int" , isPrimary: true , isNullable : false , isGenerated : true , generationStrategy : "increment"},
                    {name : "phone" , type : "varchar(11)"  , isNullable : false , isUnique : true},
                    {name : "token" , type : "varchar(50)" , isNullable : true},
                    {name : "otp" , type : "varchar(100)" , isNullable : false},
                    {name : "date" , type : "datetime" , isNullable : false},
                    {name: "created_at" , type : "datetime" , default : "CURRENT_TIMESTAMP"},
                    {name : "updated_at" , type : "datetime" , default: "CURRENT_TIMESTAMP"}
                ]
            }) ,
            true
        );


    }

    
    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropTable("otp" , true);
        
    }

}
