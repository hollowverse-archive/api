import { MigrationInterface, QueryRunner } from 'typeorm';
import { readJson } from '../../helpers/readFile';
import { Photo } from '../entities/Photo';
import * as bluebird from 'bluebird';
import * as path from 'path';
import { ColorPalette as ColorPaletteType } from '../../typings/schema';
import { ColorPalette } from '../entities/ColorPalette';
import { toPairs } from 'lodash';

export class PopulateColorPalettes1517508004832 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const json = await readJson<Record<string, Record<keyof ColorPaletteType, string | null>>>(
      path.resolve(__dirname, '../../../data/palettes.json'));
    const photoRepository = queryRunner.connection.getRepository(Photo);
    const updatedPhotos = await bluebird.map(
      toPairs(json),
      async ([fileName, { vibrant, darkVibrant, lightVibrant, muted, darkMuted, lightMuted }]) => {
        const photo = await photoRepository.findOne({ where: { s3Path: `/notable-people/${fileName}` } });

        if (photo) {
          const palette = new ColorPalette;
          palette.vibrant = vibrant;
          palette.darkVibrant = darkVibrant;
          palette.lightVibrant = lightVibrant;
          palette.muted = muted;
          palette.darkMuted = darkMuted;
          palette.lightMuted = lightMuted;

          photo.colorPalette = Promise.resolve(palette);

          return photo;
        }

        return null;
      },
    );

    await photoRepository.save(updatedPhotos.filter(v => v !== null) as Photo[]);
  }

  public async down(_: QueryRunner): Promise<any> {}
}
