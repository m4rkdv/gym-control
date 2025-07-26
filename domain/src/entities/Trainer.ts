export interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hireDate: Date;
  isActive: boolean;
}

export interface CreateTrainerDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}