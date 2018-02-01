import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColorPalette1517491695285 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'CREATE TABLE `color_palette` (`id` varchar(255) NOT NULL PRIMARY KEY, `vibrant` varchar(255), `darkVibrant` varchar(255), `lightVibrant` varchar(255), `muted` varchar(255), `darkMuted` varchar(255), `lightMuted` varchar(255)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`photo` ADD `colorPaletteId` varchar(255) NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`photo` ADD CONSTRAINT `fk_ee9030786a9ab251516f0711525` FOREIGN KEY (`colorPaletteId`) REFERENCES `color_palette`(`id`)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`photo` DROP FOREIGN KEY `fk_ee9030786a9ab251516f0711525`',
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`photo` DROP `colorPaletteId`',
    );
    await queryRunner.query('DROP TABLE `color_palette`');
  }
}
