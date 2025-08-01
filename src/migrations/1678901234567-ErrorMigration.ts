import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class ErrorMigration1678901234567 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name : "errors" ,
                columns:[
                    {name : "id" ,  type : "int" , isPrimary: true , isNullable : false , isGenerated : true , generationStrategy : "increment"},
                    {name : "url" , type : "varchar(200)" , isNullable : false},
                    {name : "method" , type : "varchar(10)" , isNullable : false},
                    {name : "ip" , type : "varchar(25)" , isNullable : false},
                    {name : "message" , type : "text" , isNullable : false},
                    {name : "statusCode" , type : "int" , isNullable : false},
                    {name: "timestamp" , type : "timestamp"},
                ]
            }) ,
            true
        );

    }

    
    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropTable("errors" , true);
        
    }

}
