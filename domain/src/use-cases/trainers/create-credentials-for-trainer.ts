import { User, userRole } from "../../entities/User";
import { createInvalidDataError, InvalidDataError } from "../../errors/error";
import { TrainerRepository } from "../../repositories/trainer-repository";
import { UserRepository } from "../../repositories/user-repository";
import { generateTrainerUserName } from "../../utils/trainer-username";

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

  const user: User = {
    id: crypto.randomUUID(),
    userName: userName,
    password: credentials.password, 
    role: "trainer" as userRole, 
    trainerId: trainer.id, 
    createdAt: new Date(),
    isActive: true,
  };

  return users.save(user);
}