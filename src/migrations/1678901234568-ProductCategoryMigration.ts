import { MigrationInterface, QueryRunner, Table , TableForeignKey } from "typeorm";

export class ProductCategoryMigration1678901234568 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name : "product_categories" ,
                columns:[
                    {name : "product_id" , type : "int" , isNullable : false},
                    {name : "category_id" , type : "int" , isNullable : false},
                ]
            }) ,
            true
        );

        await queryRunner.createForeignKey("product_categories" , new TableForeignKey({
            columnNames:['product_id'],
            referencedColumnNames : ['id'],
            referencedTableName : 'products' ,
            onDelete : "CASCADE" ,
            onUpdate : "CASCADE"
        }));


        await queryRunner.createForeignKey("product_categories" , new TableForeignKey({
            columnNames:['category_id'],
            referencedColumnNames : ['id'],
            referencedTableName : 'categories' ,
            onDelete : "CASCADE" ,
            onUpdate : "CASCADE"
        }));

    }

    
    public async down(queryRunner: QueryRunner): Promise<void> {

        const Productcategory = await queryRunner.getTable("product_categories");
        if(Productcategory){
            const productfk = Productcategory.foreignKeys.find(fk=>fk.columnNames.indexOf("product_id") !== -1);
            if(productfk){
                await queryRunner.dropForeignKey("product_categories" , productfk);
            }

            const categoryfk = Productcategory.foreignKeys.find(fk=>fk.columnNames.indexOf("category_id") !== -1);
            if(categoryfk){
                await queryRunner.dropForeignKey("product_categories" , categoryfk);
            }
            
            await queryRunner.dropTable("product_categories" , true);
        }

    }

}
