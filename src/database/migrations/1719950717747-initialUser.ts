import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class InitialUser1719950717747 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "user",
            new TableColumn({
                name: "name",
                type: "varchar",
                isNullable: false,
                isUnique: false,
                length: "100"
            }),
        )
        await queryRunner.addColumn(
            "user",
            new TableColumn({
                name: "surname",
                type: "varchar",
                isNullable: false,
                isUnique: false,
                length: "100"
            }),
        )
        await queryRunner.addColumn(
            "user",
            new TableColumn({
                name: "password",
                type: "varchar",
                isNullable: false,
                isUnique: false,
                length: "100"
            }),
        )
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("user", "name");
        await queryRunner.dropColumn("user", "surname");
        await queryRunner.dropColumn("user", "password");
    }

}
