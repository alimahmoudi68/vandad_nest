import { MigrationInterface, QueryRunner, Table , TableForeignKey } from "typeorm";

export class TicketMigration1678901234567 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name : "tickets" ,
                columns:[
                    {name : "id" ,  type : "int" , isPrimary: true , isNullable : false , isGenerated : true , generationStrategy : "increment"},
                    {name : "title" , type : "varchar(100)" , isNullable : false},
                    {name : "description" , type : "text" , isNullable : false},
                    {name : "userId" , type : "int" , isNullable : false},
                    {name : "parentId" , type : "int" , isNullable : false},
                    {name: "created_at" , type : "timestamp" , default : "CURRENT_TIMESTAMP"},
                    {name : "updated_at" , type : "timestamp" , default: "CURRENT_TIMESTAMP"}
                ]
            }) ,
            true
        );


        await queryRunner.createForeignKey("tickets" , new TableForeignKey({
            columnNames:['userId'],
            referencedColumnNames : ['id'],
            referencedTableName : 'users' ,
            onDelete : "CASCADE" ,
            onUpdate : "CASCADE"
        }));


        await queryRunner.createForeignKey("tickets" , new TableForeignKey({
            columnNames:['parentId'],
            referencedColumnNames : ['id'],
            referencedTableName : 'tickets' ,
            onDelete : "CASCADE" ,
            onUpdate : "CASCADE"
        }));

    }

    
    public async down(queryRunner: QueryRunner): Promise<void> {

        const Ticket = await queryRunner.getTable("tickets");
        if(Ticket){
            const userfk = Ticket.foreignKeys.find(fk=>fk.columnNames.indexOf("userId") !== -1);
            if(userfk){
                await queryRunner.dropForeignKey("tickets" , userfk);
            }

            const ticketfk = Ticket.foreignKeys.find(fk=>fk.columnNames.indexOf("ticketId") !== -1);
            if(ticketfk){
                await queryRunner.dropForeignKey("tickets" , ticketfk);
            }
            
            await queryRunner.dropTable("tickets" , true);
        }
    }

}
