import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class OtpAllowMigration1678901234567 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name : "otpAllow" ,
                columns:[
                    {name : "id" ,  type : "int" , isPrimary: true , isNullable : false , isGenerated : true , generationStrategy : "increment"},
                    {name : "ip" , type : "varchar(25)" , isNullable : false},
                    {name : "count" , type : "tinyint" , isNullable : false},
                    {name : "date" , type : "datetime" , isNullable : false},
                    {name: "created_at" , type : "datetime" , default : "CURRENT_TIMESTAMP"},
                    {name : "updated_at" , type : "datetime" , default: "CURRENT_TIMESTAMP"}
                ]
            }) ,
            true
        );

    }

    
    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropTable("otpAllow" , true);
        
    }

}
