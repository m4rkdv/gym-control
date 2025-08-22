"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Member } from "@gymcontrol/domain/entities/Member";
import { Payment, CreatePaymentDTO } from "@gymcontrol/domain/entities/Payment";
import { useApi } from "./api-context";

interface MembershipStatusResponse {
  memberId: string;
  membershipStatus: Member["membershipStatus"];
  paidUntil: Date;
  gracePeriod: number;
  daysRemaining: number;
}

interface ProcessPaymentResponse {
  payment: Payment;
  updatedMember: Member;
}

interface RegisterMemberRequest {
  firstName: string;
  lastName: string;
  email: string;
  weight: number;
  age: number;
  password: string;
}

interface RegisterMemberResponse {
  user: { id: string; userName: string; role: string; memberId: string };
  token: string;
}

interface MemberContextType {
  members: Member[];
  selectedMember: Member | null;
  isLoading: boolean;
  error: string | null;
  registerMember: (data: RegisterMemberRequest) => Promise<void>;
  getMyProfile: () => Promise<void>;
  verifyMembershipStatus: (memberId: string) => Promise<MembershipStatusResponse | null>;
  processPayment: (paymentData: CreatePaymentDTO) => Promise<ProcessPaymentResponse | null>;
}

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export function MemberProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { get, post } = useApi();

  const registerMember = useCallback(async (data: RegisterMemberRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await post<RegisterMemberResponse, RegisterMemberRequest>(
        '/api/auth/register',
        data
      );
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [post]);

  const getMyProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const profile = await get<Member>('/api/members/profile');
      setSelectedMember(profile);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [get]);

  const verifyMembershipStatus = useCallback(async (memberId: string): Promise<MembershipStatusResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const status = await get<MembershipStatusResponse>(`/api/members/${memberId}/status`);
      return status;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [get]);

  const processPayment = useCallback(async (paymentData: CreatePaymentDTO): Promise<ProcessPaymentResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await post<ProcessPaymentResponse, CreatePaymentDTO>(
        '/api/members/payments',
        paymentData
      );
      
      // Actualizar el miembro en el estado local si es el mismo que está seleccionado
      if (selectedMember && selectedMember.id === result.updatedMember.id) {
        setSelectedMember(result.updatedMember);
      }
      
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [post, selectedMember]);

  return (
    <MemberContext.Provider value={{
      members,
      selectedMember,
      isLoading,
      error,
      registerMember,
      getMyProfile,
      verifyMembershipStatus,
      processPayment
    }}>
      {children}
    </MemberContext.Provider>
  );
}

export const useMembers = (): MemberContextType => {
  const context = useContext(MemberContext);
  if (context === undefined) {
    throw new Error("useMembers must be used within a MemberProvider");
  }
  return context;
};
