import 'reflect-metadata';
import { createConnection, ConnectionOptions } from 'typeorm';
import { NotablePerson } from './entities/notablePerson';
import { Event } from './entities/event';
import { Label } from './entities/label';
import { Comment } from './entities/comment';
import { User } from './entities/user';

import * as fs from 'fs';
import * as path from 'path';

const DB_SECRET_FILE_PATH = path.resolve(
  process.cwd(),
  'secrets',
  'db.production.json',
);

function readJSON<T>(file: string): T {
  return JSON.parse(String(fs.readFileSync(file)));
}

const config: ConnectionOptions = {
  type: 'mysql',

  ...process.env.NODE_ENV === 'production'
    ? {
        // Do not any of these set to `true`,
        // otherwise the database will be destroyed
        synchronize: false,
        dropSchema: false,

        ...readJSON<DatabaseConfig>(DB_SECRET_FILE_PATH),
      }
    : {
        database: 'hollowverse',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '123456',
      },
};

export const connection = createConnection({
  ...config,
  entities: [NotablePerson, Event, Label, Comment, User],
});
