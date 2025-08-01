import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class ProfileMigration1678901234567 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name : "profiles" ,
                columns:[
                    {name : "id" ,  type : "int" , isPrimary: true ,  isNullable : false , isGenerated : true , generationStrategy : "increment"},
                    {name : "bio" , type : "varchar(300)" , isNullable : true},
                    {name : "userId" , type : "int" , isNullable : false},
                    {name: "created_at" , type : "timestamp" , default : "CURRENT_TIMESTAMP"} ,
                    {name : "updated_at" , type : "timestamp" , default: "CURRENT_TIMESTAMP"}
                ]
            }) ,
            true
        )

        await queryRunner.createForeignKey("profiles" , new TableForeignKey({
            columnNames:['userId'],
            referencedColumnNames : ['id'],
            referencedTableName : 'users' ,
            onDelete : "CASCADE"
        }));

    }

    
    public async down(queryRunner: QueryRunner): Promise<void> {
        
        //  اول کلید های خارجی را پاک می کنه
        const profile = await queryRunner.getTable("profiles");
        if(profile){
            const userfk = profile.foreignKeys.find(fk=>fk.columnNames.indexOf("userId") !== -1);
            if(userfk){
                await queryRunner.dropForeignKey("profiles" , userfk);
            }
            
            await queryRunner.dropTable("profiles" , true);
        }
      
    }

}
