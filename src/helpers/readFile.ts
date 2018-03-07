import fs from 'fs';
import { promisify } from 'util';

export const readFile = promisify(fs.readFile);

export async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(String(await readFile(file)));
}
