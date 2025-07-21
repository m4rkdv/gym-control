export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email:string;
  weight: number;
  age: number;
  joinDate: Date;
  membershipStatus: 'active' | 'inactive' | 'suspended' | 'deleted';
  paidUntil: Date;
}

export type CreateMemberDTO = Omit<Member, 'id' | 'membershipStatus' | 'paidUntil'>;
export type UpdateMemberDTO = Partial<Omit<Member, 'id' | 'joinDate'>>;