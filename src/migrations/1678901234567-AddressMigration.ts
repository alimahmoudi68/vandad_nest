import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class AddressMigration1678901234567 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name : "addresses" ,
                columns:[
                    {name : "id" ,  type : "int" , isPrimary: true , isNullable : false , isGenerated : true , generationStrategy : "increment"},
                    {name : "province" , type : "varchar(100)" , isNullable : false},
                    {name :  "city" , type : "varchar(100)" , isNullable : false},
                    {name : "address" , type : "text" , isNullable : false},
                    {name : "postal_code" , type : "varchar(10)" , isNullable : false},
                    {name : "receiver_phone" , type : "varchar(11)"  , isNullable : false},
                    {name : "description" , type : "text" , isNullable : true},
                    {name : "userId" , type : "int" , isNullable : false},
                    {name: "created_at" , type : "timestamp" , default : "CURRENT_TIMESTAMP"},
                    {name : "updated_at" , type : "timestamp" , default: "CURRENT_TIMESTAMP"}
                ]
            }) ,
            true
        );


        await queryRunner.createForeignKey("addresses" , new TableForeignKey({
            columnNames:['userId'],
            referencedColumnNames : ['id'],
            referencedTableName : 'users' ,
            onDelete : "CASCADE" ,
            onUpdate : "CASCADE"
        }));

    }

    
    public async down(queryRunner: QueryRunner): Promise<void> {

        const Address = await queryRunner.getTable("addresses");
        if(Address){
            const userfk = Address.foreignKeys.find(fk=>fk.columnNames.indexOf("userId") !== -1);
            if(userfk){
                await queryRunner.dropForeignKey("addresses" , userfk);
            }
            
            await queryRunner.dropTable("addresses" , true);
        }
    }

}
