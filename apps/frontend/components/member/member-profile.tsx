"use client";

import { useEffect, useRef } from "react";
import { useMembers } from "@/contexts/member-context";
import { useAuth } from "@/contexts/auth-context";

interface MemberProfileProps {
  className?: string;
}

export function MemberProfile({ className = "" }: MemberProfileProps) {
  const { selectedMember, isLoading, error, getMyProfile, verifyMembershipStatus } = useMembers();
  const { token, user } = useAuth();
  const hasLoadedProfile = useRef(false);

  useEffect(() => {
    
    if (token && user && user.role === 'member' && !hasLoadedProfile.current) {
      hasLoadedProfile.current = true;
      getMyProfile().catch(err => {
        console.error('Error loading profile:', err);
        hasLoadedProfile.current = false; 
      });
    }
    
    
    if (!token || !user) {
      hasLoadedProfile.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]); 

  
  const shouldShowError = token && user && error;
  const shouldShowLoading = isLoading;
  const shouldShowProfile = token && user && selectedMember;

  if (!token || !user) {
    return (
      <div className={`p-6 bg-card rounded-lg shadow ${className}`}>
        <h3 className="text-lg font-semibold mb-4">My Profile</h3>
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </div>
    );
  }

  if (user.role !== 'member') {
    return (
      <div className={`p-6 bg-card rounded-lg shadow ${className}`}>
        <h3 className="text-lg font-semibold mb-4">My Profile</h3>
        <p className="text-muted-foreground">Profile view is only available for members.</p>
      </div>
    );
  }

  const handleCheckStatus = async () => {
    if (selectedMember) {
      const status = await verifyMembershipStatus(selectedMember.id);
      if (status) {
        console.log("Membership status:", status);
      
      }
    }
  };

  if (shouldShowLoading) {
    return (
      <div className={`p-6 bg-card rounded-lg shadow ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (shouldShowError) {
    return (
      <div className={`p-6 bg-card rounded-lg shadow ${className}`}>
        <div className="text-red-600">
          <h3 className="font-semibold mb-2">Error loading profile</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!shouldShowProfile) {
    return (
      <div className={`p-6 bg-card rounded-lg shadow ${className}`}>
        <p className="text-muted-foreground">No member profile found</p>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-card rounded-lg shadow ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold">My Profile</h2>
        <button
          onClick={handleCheckStatus}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Check Status
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
            Personal Information
          </h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Name:</span>{" "}
              {selectedMember.firstName} {selectedMember.lastName}
            </div>
            <div>
              <span className="font-medium">Email:</span>{" "}
              {selectedMember.email}
            </div>
            <div>
              <span className="font-medium">Age:</span>{" "}
              {selectedMember.age} years
            </div>
            <div>
              <span className="font-medium">Weight:</span>{" "}
              {selectedMember.weight} kg
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
            Membership
          </h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Status:</span>{" "}
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  selectedMember.membershipStatus === "active"
                    ? "bg-green-100 text-green-800"
                    : selectedMember.membershipStatus === "inactive"
                    ? "bg-red-100 text-red-800"
                    : selectedMember.membershipStatus === "suspended"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {selectedMember.membershipStatus}
              </span>
            </div>
            <div>
              <span className="font-medium">Member Since:</span>{" "}
              {new Date(selectedMember.joinDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
