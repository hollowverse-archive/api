import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { NotablePerson } from './entities/notablePerson';
import { Event } from './entities/event';

export const connection = createConnection({
  database: 'hollowverse',
  host: 'localhost',
  username: 'root',
  password: '123456',
  port: 3306,
  type: 'mysql',
  entities: [NotablePerson, Event],
});
