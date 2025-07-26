export interface User {
  id: string;
  userName: string;  // Members use their email as username
  password: string;
  role: userRole;
  memberId?: string; // only for role 'member'
  trainerId?: string;
  createdAt: Date;
  isActive: boolean;
}

// repo
export type CreateUserDTO = Omit<User, 'id' | 'createdAt'>; 
//login
export type LoginDTO = {
  userName: string;
  password: string;
};

export type userRole = 'member' | 'trainer' | 'admin';
