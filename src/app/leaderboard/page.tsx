"use client";

import { AuthWrapper } from "@/components/auth/AuthWrapper";
import { CommonNavbar } from "@/components/common/CommonNavbar";
import { Leaderboard } from "@/components/leaderboard/Leaderboard";
import { UserData } from "@/modules/onboarding/types";
import { useQueryClient } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { Suspense, useEffect, useState } from "react";

function LeaderboardContent() {
  const [isChipVisible, setIsChipVisible] = useState(true);
  //use cached calibration status from reqct query
  const queryClient = useQueryClient();
  const calibrationStatus = queryClient.getQueryData(['calibration-status']);

  useEffect(() => {
    if (calibrationStatus && (calibrationStatus as any).isCalibrated && (calibrationStatus as any).isMinimumRequisiteCompleteForCalibration) {
      setIsChipVisible(false);
    }
  }, ['calibration-status']);

  return (
    <AuthWrapper>
      {(userData: UserData) => (
        <div className="min-h-screen flex flex-col max-w-md mx-auto">
          {/* REMOVED THE HEADER SECTION */}

          {isChipVisible && (
            <div
              className={`fixed bottom-[105px] left-1/2 transform -translate-x-1/2 z-40 max-w-[310px] w-full px-4 transition-all duration-300 ease-in-out ${isChipVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
            >
              <div className="rounded-full px-2 py-1.5 bg-gradient-to-r from-yellow-200/20 via-white/15 to-yellow-200/20 backdrop-blur-md border border-yellow-200/30 shadow-lg">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex-1 text-xs text-center text-yellow-100 font-medium leading-relaxed">
                    Play 3+ matches to unlock your spot!
                  </p>
                  <button
                    onClick={() => setIsChipVisible(false)}
                    className="flex-shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors"
                    aria-label="Close"
                  >
                    <XIcon className="w-4 h-4 text-yellow-100" />
                  </button>
                </div>
              </div>
            </div>
          )}

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
