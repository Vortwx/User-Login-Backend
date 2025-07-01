import { User } from '../entities/user.entity';

// Used for dependency injection
export const USER_REPOSITORY_TOKEN = 'IUserRepository';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByPhoneNumber(phoneNumber: string): Promise<User | null>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
}