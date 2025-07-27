import { CreateTrainerDTO, Trainer } from "../entities/Trainer";
import { createInvalidDataError, InvalidDataError } from "../errors/error";
import { TrainerRepository } from "../repositories/trainer-repository";

export interface RegisterTrainerDependencies {
  trainers: TrainerRepository;
}

export type CreateTrainerRequest = CreateTrainerDTO;

export async function RegisterTrainer(
  { trainers }: RegisterTrainerDependencies,
  trainerDTO: CreateTrainerRequest
): Promise<InvalidDataError | Trainer> {
  const validationError = validateData(trainerDTO);
  if (validationError) return validationError;

  const existing = await trainers.findByEmail(trainerDTO.email);
  if (existing) return createInvalidDataError("Email already in use");

  const trainer: Trainer = {
    id: crypto.randomUUID(),
    ...trainerDTO,
    hireDate: new Date(),
    isActive: true,
  };

  return trainers.save(trainer);
}

function validateData(dto: CreateTrainerDTO): InvalidDataError | void {
  if (!dto.firstName.trim()) return createInvalidDataError("First name must not be empty");
  if (!dto.lastName.trim()) return createInvalidDataError("Last name must not be empty");
  if (!dto.email.trim()) return createInvalidDataError("Email must not be empty");
  if (!dto.phone.trim()) return createInvalidDataError("Phone must not be empty");
}