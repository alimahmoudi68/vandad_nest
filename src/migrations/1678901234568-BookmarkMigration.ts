import { MigrationInterface, QueryRunner, Table , TableForeignKey } from "typeorm";

export class BookmarkMigration1678901234568 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name : "bookmarks" ,
                columns:[
                    {name : "product_id" , type : "int" , isNullable : false},
                    {name : "user_id" , type : "int" , isNullable : false},
                ]
            }) ,
            true
        );

        await queryRunner.createForeignKey("bookmarks" , new TableForeignKey({
            columnNames:['product_id'],
            referencedColumnNames : ['id'],
            referencedTableName : 'products' ,
            onDelete : "CASCADE" ,
            onUpdate : "CASCADE"
        }));


        await queryRunner.createForeignKey("bookmarks" , new TableForeignKey({
            columnNames:['user_id'],
            referencedColumnNames : ['id'],
            referencedTableName : 'users' ,
            onDelete : "CASCADE" ,
            onUpdate : "CASCADE"
        }));

    }

    
    public async down(queryRunner: QueryRunner): Promise<void> {

        const Bookmark = await queryRunner.getTable("bookmarks");
        if(Bookmark){
            const productfk = Bookmark.foreignKeys.find(fk=>fk.columnNames.indexOf("product_id") !== -1);
            if(productfk){
                await queryRunner.dropForeignKey("bookmarks" , productfk);
            }

            const userfk = Bookmark.foreignKeys.find(fk=>fk.columnNames.indexOf("user_id") !== -1);
            if(userfk){
                await queryRunner.dropForeignKey("bookmarks" , userfk);
            }
            
            await queryRunner.dropTable("bookmarks" , true);
        }

    }

}
