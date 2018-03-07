import { User } from '../database/entities/User';
import { NotablePerson } from '../database/entities/NotablePerson';
import DataLoader from 'dataloader';

export type SchemaContext = {
  viewer?: User;
  userPhotoUrlLoader: DataLoader<string, string>;
  notablePersonBySlugLoader: DataLoader<string, NotablePerson | undefined>;
  photoUrlLoader: DataLoader<string | undefined, string>;
};
