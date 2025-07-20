import { describe, test, expect } from 'vitest';
import { Member, CreateMemberDTO, UpdateMemberDTO } from './Member';

describe('Member Entity', () => {
  test('should have correct Member interface structure', () => {
    const member: Member = {
      id: '1',
      firstName: 'John',
      email:'jhon@doe.com',
      lastName: 'Doe',
      weight: 70,
      age: 25,
      joinDate: new Date(),
      membershipStatus: 'active',
      paidUntil: new Date()
    };
    
    expect(member).toBeDefined();
    expect(typeof member.id).toBe('string');
    expect(typeof member.firstName).toBe('string');
    expect(member.membershipStatus).toMatch(/^(active|inactive|suspended|deleted)$/);
  });

  test('should exclude correct fields in CreateMemberDTO', () => {
    const createMember: CreateMemberDTO = {
      firstName: 'John',
      email:'jhon@doe.com',
      lastName: 'Doe',
      weight: 70,
      age: 25,
      joinDate: new Date()
    };
    
    // @ts-expect-error - id should not exist
    expect(createMember.id).toBeUndefined();
    // @ts-expect-error - membershipStatus should not exist
    expect(createMember.membershipStatus).toBeUndefined();
    // @ts-expect-error - paidUntil should not exist
    expect(createMember.paidUntil).toBeUndefined();
  });

  test('should allow optional fields in UpdateMemberDTO', () => {
    const updateMember: UpdateMemberDTO = {
      firstName: 'Jane'
    };
    
    expect(updateMember.firstName).toBe('Jane');
    
    const fullUpdate: UpdateMemberDTO = {
      firstName: 'Jane',
      lastName: 'Smith',
      weight: 65,
      age: 30,
      membershipStatus: 'inactive',
      paidUntil: new Date()
    };
    
    expect(fullUpdate).toBeDefined();
  });
});