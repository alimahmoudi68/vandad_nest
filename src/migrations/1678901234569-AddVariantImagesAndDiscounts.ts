import { MigrationInterface, QueryRunner, TableColumn, Table } from "typeorm";

export class AddVariantImagesAndDiscounts1678901234569 implements MigrationInterface {
    name = 'AddVariantImagesAndDiscounts1678901234569'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add discount and discountPrice columns to product_variants table
        await queryRunner.addColumns("product_variants", [
            new TableColumn({
                name: "discount",
                type: "boolean",
                default: false
            }),
            new TableColumn({
                name: "discountPrice",
                type: "int",
                default: 0
            })
        ]);

        // Create junction table for variant images
        await queryRunner.createTable(
            new Table({
                name: "product_variants_uploads_upload",
                columns: [
                    {
                        name: "productVariantId",
                        type: "int",
                        isPrimary: true
                    },
                    {
                        name: "uploadId",
                        type: "int",
                        isPrimary: true
                    }
                ],
                foreignKeys: [
                    {
                        columnNames: ["productVariantId"],
                        referencedTableName: "product_variants",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE"
                    },
                    {
                        columnNames: ["uploadId"],
                        referencedTableName: "upload",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE"
                    }
                ]
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop junction table
        await queryRunner.dropTable("product_variants_uploads_upload");
        
        // Remove columns from product_variants table
        await queryRunner.dropColumns("product_variants", ["discount", "discountPrice"]);
    }
}
