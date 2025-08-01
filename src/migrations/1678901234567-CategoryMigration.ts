import { MigrationInterface, QueryRunner, Table , TableForeignKey } from "typeorm";

export class CategoryMigration1678901234567 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name : "categories" ,
                columns:[
                    {name : "id" ,  type : "int" , isPrimary: true , isNullable : false , isGenerated : true , generationStrategy : "increment"},
                    {name : "title" , type : "varchar(100)" , isNullable : false},
                    {name: "created_at" , type : "timestamp" , default : "CURRENT_TIMESTAMP"},
                    {name : "updated_at" , type : "timestamp" , default: "CURRENT_TIMESTAMP"}
                ]
            }) ,
            true
        );

    }

    
    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropTable("categories" , true);

    }

}
