import { CreateUserDTO, User } from "../entities/User";
import { UserRepository } from "../repositories/user-repository";
import { MOCK_DELAY } from "./MockDelay";

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

    async findByTrainerId(trainerId: string): Promise<User | null> {
      return this.users.find(u => u.trainerId === trainerId) ?? null;
    },

    async save(user: CreateUserDTO): Promise<User> {
      const existingUserIndex = users.findIndex(u => u.userName === user.userName);
      if (existingUserIndex !== -1) {
        await simulateDatabaseDelay(null);


        users[existingUserIndex] = {
          ...users[existingUserIndex],
          ...user,
          id: users[existingUserIndex].id,
          createdAt: users[existingUserIndex].createdAt
        };

        return users[existingUserIndex];
      }

      const newUser: User = {
        ...user,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        isActive: user.isActive ?? true
      };

      await simulateDatabaseDelay(null);
      this.users.push(newUser);
      return newUser;
    },
  };
}