import 'reflect-metadata';
import { createConnection, ConnectionOptions } from 'typeorm';
import { NotablePerson } from './entities/notablePerson';
import { Event } from './entities/event';
import { Label } from './entities/label';
import { Comment } from './entities/comment';
import { User } from './entities/user';
import { readJson } from '../helpers/readJson';

const getConfig = async (): Promise<ConnectionOptions> => ({
  type: 'mysql',

  ...process.env.NODE_ENV === 'production'
    ? {
        ...await readJson<DatabaseConfig>('secrets/db.production.json'),

        // Do not any of these set to `true`,
        // otherwise the database will be destroyed
        synchronize: false,
        dropSchema: false,
      }
    : {
        database: 'hollowverse',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '123456',
      },
});

export const connection = getConfig().then(config =>
  createConnection({
    ...config,
    entities: [NotablePerson, Event, Label, Comment, User],
  }),
);
