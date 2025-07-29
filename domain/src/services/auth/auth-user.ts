import { LoginDTO, User } from "../../entities/User";
import { createInvalidDataError, InvalidDataError } from "../../errors/error";
import { UserRepository } from "../../repositories/user-repository";
import bcrypt from 'bcrypt';



export interface AuthenticateUserDependencies {
  users: UserRepository;
}

export type LoginRequest = LoginDTO;

/**
 * Payload returned when authentication succeeds.
 */
export type AuthenticationResult = {
  /** Logged-in user record without the password field. */
  user: Omit<User, "password">;
  /** Flag that guarantees the user was successfully authenticated. */
  isAuthenticated: true;
};

/**
 * Attempts to authenticate a user with the provided credentials.
 *
 * @function AuthenticateUser
 *
 * @param {AuthenticateUserDependencies} deps - Collaborators injected via dependency-injection.
 * @param {LoginRequest} credentials - Login credentials supplied by the caller.
 *
 * @returns {Promise<InvalidDataError | AuthenticationResult>}
 *   - `InvalidDataError` when validation fails or credentials are invalid.
 *   - `AuthenticationResult` when the user is successfully authenticated.
 */
export async function AuthenticateUser(
  { users }: AuthenticateUserDependencies,
  credentials: LoginRequest
): Promise<InvalidDataError | AuthenticationResult> {
  
  if (!credentials.userName.trim()) return createInvalidDataError("Username must not be empty");
  if (!credentials.password.trim()) return createInvalidDataError("Password must not be empty");

  const user = await users.findByUserName(credentials.userName);
  if (!user) return createInvalidDataError("Invalid credentials");

  if (!user.isActive) return createInvalidDataError("User account is inactive");

  const passwordMatches = await bcrypt.compare(credentials.password, user.password);
  if (!passwordMatches) return createInvalidDataError("Invalid credentials");

  const { password, ...userWithoutPassword } = user;
  
  return {
    user: userWithoutPassword,
    isAuthenticated: true
  };
}