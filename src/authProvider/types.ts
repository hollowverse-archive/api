import { User } from '../database/entities/User';
import { Connection } from 'typeorm';

export type PhotoSize = 'small' | 'normal' | 'large';

export declare class AuthProvider<Config = any> {
  constructor(connection: Connection, config: Config);

  findUserByToken(token: string): Promise<User | undefined>;

  getProfileDetailsByToken(
    token: string,
  ): Promise<{ id: string; name: string; email?: string }>;

  getPhotoUrlByUserId(id: string, size?: PhotoSize): Promise<string>;
}
