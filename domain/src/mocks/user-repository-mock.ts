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
    async findByUserName(userName: string): Promise<User | null> {
      const user = this.users.find(u => u.userName === userName) ?? null;
      return simulateDatabaseDelay(user);
    },

    async findById(id: string): Promise<User | null> {
      const user = this.users.find(u => u.id === id) ?? null;
      return simulateDatabaseDelay(user);
    },

    async save(user: CreateUserDTO): Promise<User> {
      const exists = this.users.find(u => u.userName === user.userName);
      if (exists) {
        await simulateDatabaseDelay(null);
        throw new Error("Username already in use");
      }

      const newUser: User = {
        ...user,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };
      
      await simulateDatabaseDelay(null); 
      this.users.push(newUser);
      return newUser;
    },
  };
}