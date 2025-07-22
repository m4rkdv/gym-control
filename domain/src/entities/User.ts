
export interface User {
  id: string;
  email: string;
  hashedPassword: string;
  role: 'member' | 'trainer' | 'admin';
  memberId?: string; // Solo para usuarios con rol 'member'
  createdAt: Date;
  isActive: boolean;
}

export type CreateUserDTO = Omit<User, 'id' | 'createdAt'>;
export type LoginDTO = {
  email: string;
  password: string;
};