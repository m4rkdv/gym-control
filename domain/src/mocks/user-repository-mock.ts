import { CreateUserDTO, User } from "../entities/User";
import { UserRepository } from "../repositories/user-repository";

const MOCK_DELAY = {
  MIN: 100,   // 0.1 s
  MAX: 1500    // 1.5 s
};

export interface MockedUserRepository extends UserRepository {
  users: User[];
}

export function mockUserRepository(users: User[] = []): MockedUserRepository {
  let currentDelay = Math.floor(
    Math.random() * (MOCK_DELAY.MAX - MOCK_DELAY.MIN) + MOCK_DELAY.MIN
  );

  const simulateDatabaseDelay = async <T>(result: T): Promise<T> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(result), currentDelay);
    });
  };

  return {
    users,
    async findByEmail(email: string): Promise<User | null> {
      const user = this.users.find(u => u.email === email) ?? null;
      return simulateDatabaseDelay(user);
    },

    async findById(id: string): Promise<User | null> {
      const user = this.users.find(u => u.id === id) ?? null;
      return simulateDatabaseDelay(user);
    },

    async save(user: CreateUserDTO): Promise<User> {
      const exists = this.users.find(u => u.email === user.email);
      if (exists) {
        await simulateDatabaseDelay(null);
        throw new Error("Email already in use");
      }

      const newUser: User = {
        ...user,
        id: crypto.randomUUID?.() ?? Math.random().toString(),
        createdAt: new Date(),
      };
      
      await simulateDatabaseDelay(null); 
      this.users.push(newUser);
      return newUser;
    },
  };
}