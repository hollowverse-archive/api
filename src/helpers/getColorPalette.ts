import Vibrant from 'node-vibrant';
import { mapValues } from 'lodash';
import { ColorPalette } from '../typings/schema';

export const getColorPalette = async (buffer: Buffer): Promise<ColorPalette> => {
  const palette = await Vibrant.from(buffer).getPalette();

  return mapValues(palette, color => (color ? color.getHex() : null));
};
