import { User, userRole } from "../../entities/User.js";
import { createInvalidDataError, InvalidDataError } from "../../errors/error.js";
import { TrainerRepository } from "../../repositories/trainer-repository.js";
import { UserRepository } from "../../repositories/user-repository.js";
import { generateTrainerUserName } from "../../utils/trainer-username.js";
import bcrypt from 'bcrypt';


export interface CreateCredentialsForTrainerDependencies {
  users: UserRepository;
  trainers: TrainerRepository;
}

export type CreateTrainerCredentialsRequest = {
  trainerId: string;
  password: string;
};

export async function CreateCredentialsForTrainer(
  { users, trainers }: CreateCredentialsForTrainerDependencies,
  credentials: CreateTrainerCredentialsRequest
): Promise<InvalidDataError | User> {

  if (!credentials.password.trim()) return createInvalidDataError("Password must not be empty");

  const trainer = await trainers.findById(credentials.trainerId);
  if (!trainer) return createInvalidDataError("Trainer not found in repository");

  const existingCredentials = await users.findByTrainerId(trainer.id);
  if (existingCredentials) {
    return createInvalidDataError("Trainer already has credentials");
  }

  // Trainers use coach-firtName-(count suffix is added to handle duplicates)
  const userName = await generateTrainerUserName(trainer.firstName, users);
  const passwordHash = await bcrypt.hash(credentials.password, 10); // 10 = salt rounds
  
  const user: User = {
    id: crypto.randomUUID(),
    userName: userName,
    password: passwordHash, 
    role: "trainer" as userRole, 
    trainerId: trainer.id, 
    createdAt: new Date(),
    isActive: true,
  };

  return users.save(user);
}