import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { NotablePerson } from './entities/notablePerson';
import { Event } from './entities/event';

export const connection = createConnection({
  type: 'mysql',
  database: 'hollowverse',
  host: 'localhost',
  username: 'root',
  password: '123456',
  dropSchema: true,
  synchronize: true,
  port: 3306,
  entities: [NotablePerson, Event],
});
