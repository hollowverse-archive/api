import { User } from '../database/entities/User';
import { NotablePerson } from '../database/entities/NotablePerson';
import DataLoader from 'dataloader';
import { Connection } from 'typeorm';

export type SchemaContext = {
  connection: Connection;
  viewer?: User;
  userPhotoUrlLoader: DataLoader<string, string>;
  notablePersonBySlugLoader: DataLoader<string, NotablePerson | undefined>;
  photoUrlLoader: DataLoader<string | undefined, string>;
  getProfileDetailsFromAuthProvider(
    token: string,
  ): Promise<{ id: string; name: string; email?: string }>;
  getPhotoUrlFromAuthProvider(
    id: string,
    size?: 'small' | 'normal' | 'large',
  ): Promise<string>;
};
