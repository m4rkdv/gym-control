import { Trainer } from "../entities/Trainer";

export interface TrainerRepository {
  save(trainer: Trainer): Promise<Trainer>;
  findById(id: string): Promise<Trainer | null>;
  findByEmail(email: string): Promise<Trainer | null>;
  findAll(): Promise<Trainer[]>;
  findByIsActive(isActive: boolean): Promise<Trainer[]>;
}