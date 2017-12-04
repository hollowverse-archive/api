import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePhotoId1512401388459 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`notable_person` DROP `photoId`',
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`notable_person_label` CHANGE `id` `id` varchar(255) NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`editorial_summary_node` CHANGE `id` `id` varchar(255) NOT NULL',
    );
    await queryRunner.query(
      "ALTER TABLE `hollowverse`.`editorial_summary_node` CHANGE `type` `type` enum('break', 'sentence', 'quote', 'heading') NOT NULL",
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`notable_person` CHANGE `id` `id` varchar(255) NOT NULL',
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
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
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
      'ALTER TABLE `hollowverse`.`notable_person` CHANGE `id` `id` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL',
    );
    await queryRunner.query(
      "ALTER TABLE `hollowverse`.`editorial_summary_node` CHANGE `type` `type` enum(8)('break', 'sentence', 'quote', 'heading') CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL",
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`editorial_summary_node` CHANGE `id` `id` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`notable_person_label` CHANGE `id` `id` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `hollowverse`.`notable_person` ADD `photoId` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL UNIQUE',
    );
  }
}
