import { User } from "../entities/User";

export interface UserRepository {
  save(user: User): Promise<User>;
  findByUserName(userName: string): Promise<User | null>;
  findByTrainerId(trainerId: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}