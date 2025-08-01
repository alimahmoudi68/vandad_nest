import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class ProductMigration1678901234567 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name : "products" ,
                columns:[
                    {name : "id" ,  type : "int" , isPrimary: true , isNullable : false , isGenerated : true , generationStrategy : "increment"},
                    {name : "title" , type : "varchar(100)" , isNullable : false},
                    {name : "description" , type : "text" , isNullable : true},
                    {name : "price" , type : "int" , isNullable : false},
                    {name: "created_at" , type : "timestamp" , default : "CURRENT_TIMESTAMP"},
                    {name : "updated_at" , type : "timestamp" , default: "CURRENT_TIMESTAMP"}
                ]
            }) ,
            true
        );

    }

    
    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropTable("products" , true);
        
    }

}
