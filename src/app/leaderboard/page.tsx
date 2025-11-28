"use client";

import { AuthWrapper } from "@/components/auth/AuthWrapper";
import { CommonNavbar } from "@/components/common/CommonNavbar";
import { Leaderboard } from "@/components/leaderboard/Leaderboard";
import { UserData } from "@/modules/onboarding/types";
import { Suspense } from "react";

function LeaderboardContent() {
  return (
    <AuthWrapper>
      {(userData: UserData) => (
        <div className="min-h-screen flex flex-col max-w-md mx-auto">
          {/* REMOVED THE HEADER SECTION */}

          {/* Leaderboard Content */}
          <Leaderboard />

          {/* Common Navbar */}
          <CommonNavbar activeTab="leaderboard" />
        </div>
      )}
    </AuthWrapper>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen text-white">
          Loading...
        </div>
      }
    >
      <LeaderboardContent />
    </Suspense>
  );
}
