import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEditorRoleToHollowverseEditor1522956361650
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner) {
    await queryRunner.query(
      // tslint:disable-next-line:quotemark
      "ALTER TABLE `hollowverse`.`user` ADD role enum('EDITOR')",
    );
  }

  public async down(queryRunner: QueryRunner) {
    await queryRunner.query('ALTER TABLE `hollowverse`.`user` DROP role');
  }
}
