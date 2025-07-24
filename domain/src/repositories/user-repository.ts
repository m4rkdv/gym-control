import { User } from "../entities/User";

export interface UserRepository {
  save(user: Omit<User, "id" | "createdAt">): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}