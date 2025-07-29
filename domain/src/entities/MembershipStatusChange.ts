export interface MembershipStatusChange {
  memberId: string;
  fromStatus: 'active' | 'inactive' | 'suspended';
  toStatus: 'active' | 'inactive' | 'suspended' | 'deleted';
  reason?: string;
  changedAt: Date;
}
