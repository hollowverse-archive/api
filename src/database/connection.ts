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
  process.env.NODE_ENV === 'production' ? 'db.production.json' : 'db.json',
);

const { host, port, database, username, password }: DatabaseConfig = JSON.parse(
  String(fs.readFileSync(DB_SECRET_FILE_PATH)),
);

const config: ConnectionOptions = {
  type: 'mysql',

  // Do not any of these set to `true`,
  // otherwise the database will be destroyed
  synchronize: false,
  dropSchema: false,

  host,
  port,
  database,
  username,
  password,
};

export const connection = createConnection({
  ...config,
  entities: [NotablePerson, Event, Label, Comment, User],
});
