import DataLoader from 'dataloader';
import { Connection } from 'typeorm';
import { AuthProvider } from '../authProvider/types';
import { NotablePerson } from '../database/entities/NotablePerson';
import { User } from '../database/entities/User';

export type SchemaContext = {
  connection: Connection;
  viewer?: User;
  userPhotoUrlLoader: DataLoader<string, string>;
  notablePersonBySlugLoader: DataLoader<string, NotablePerson | undefined>;
  photoUrlLoader: DataLoader<string | undefined, string>;
  authProvider: AuthProvider;
};
