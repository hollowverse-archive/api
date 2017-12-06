import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEditorialSummary1512576264261 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      "CREATE TABLE `editorial_summary_node` (`id` varchar(255) NOT NULL PRIMARY KEY, `order` smallint(5) NOT NULL, `type` enum('break', 'sentence', 'quote', 'heading') NOT NULL, `text` varchar(1000), `sourceUrl` varchar(500), `sourceTitle` varchar(255), `notablePersonId` varchar(255) NOT NULL) ENGINE=InnoDB",
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`notable_person` ADD `editorialSummaryAuthor` varchar(255)',
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`notable_person_label` CHANGE `id` `id` varchar(255) NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`notable_person` CHANGE `id` `id` varchar(255) NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`notable_person` CHANGE `photoId` `photoId` varchar(255) UNIQUE',
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`user` CHANGE `id` `id` varchar(255) NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`event_label` CHANGE `id` `id` varchar(255) NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`notable_person_event` CHANGE `id` `id` varchar(255) NOT NULL',
    );
    await queryRunner.query(
      "ALTER TABLE `hollowverse`.`notable_person_event` CHANGE `type` `type` enum('quote', 'donation', 'appearance') NOT NULL",
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`notable_person_event_comment` CHANGE `id` `id` varchar(255) NOT NULL',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX `ind_3ab2c20998a61099888185308d` ON `editorial_summary_node`(`order`, `notablePersonId`)',
    );
    await queryRunner.query(
      'ALTER TABLE `editorial_summary_node` ADD CONSTRAINT `fk_516351dd34efc1ce27903b84564` FOREIGN KEY (`notablePersonId`) REFERENCES `notable_person`(`id`)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `editorial_summary_node` DROP FOREIGN KEY `fk_516351dd34efc1ce27903b84564`',
    );
    await queryRunner.query(
      'ALTER TABLE `editorial_summary_node` DROP INDEX `ind_3ab2c20998a61099888185308d`',
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`notable_person_event_comment` CHANGE `id` `id` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL',
    );
    await queryRunner.query(
      "ALTER TABLE `hollowverse`.`notable_person_event` CHANGE `type` `type` enum(10)('quote', 'donation', 'appearance') CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL",
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`notable_person_event` CHANGE `id` `id` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`event_label` CHANGE `id` `id` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`user` CHANGE `id` `id` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`notable_person` CHANGE `photoId` `photoId` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL UNIQUE',
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`notable_person` CHANGE `id` `id` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`notable_person_label` CHANGE `id` `id` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`notable_person` DROP `editorialSummaryAuthor`',
    );
    await queryRunner.query('DROP TABLE `editorial_summary_node`');
  }
}
