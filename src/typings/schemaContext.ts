import { User } from '../database/entities/user';

export type SchemaContext = {
  viewer?: User;
};
