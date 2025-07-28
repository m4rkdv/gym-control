import { UserRepository } from "../repositories/user-repository";

export async function generateTrainerUserName(
  firstName: string,
  users: UserRepository
): Promise<string> {
  const base = `coach-${firstName.toLowerCase().replace(/\s+/g, '')}`;

  let candidate = base;
  let counter = 2;

  while (await users.findByUserName(candidate)) {
    candidate = `${base}-${counter}`;
    counter++;
  }

  return candidate;
}