import { User } from '../database/entities/User';
import * as DataLoader from 'dataloader';

export type SchemaContext = {
  viewer?: User;
  userPhotoUrlLoader: DataLoader<string, string>;
};
