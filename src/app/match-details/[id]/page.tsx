"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { CalendarIcon, ChevronLeft, ClockIcon, ContactIcon, PhoneIcon, Share2, WatchIcon } from "lucide-react";
import { useMatchDetails } from "@/hooks/useMatchDetails";
import { useLocation } from "@/contexts/LocationContext";
import { calculateDistance } from "@/lib/utils/distance";
import { Button } from "@/components/ui/button";
import { useToast } from '@/contexts/ToastContext';
import { useState } from 'react';
import api from "@/lib/api";

const MatchDetailsPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { data: matchData, isLoading, error } = useMatchDetails(Number(id));
    const { location } = useLocation();
    const { showToast } = useToast();
    const [isBooking, setIsBooking] = useState(false);
    console.log("matchData", matchData);
    const handleBack = () => {
        router.push("/play");
    };

    const handleBookSlot = async () => {
        if (Date.now() > parseISO(matchData.endTime).getTime()) {
            showToast("Oops! This match has ended.", "error");
            return;
        }
        if (Date.now() > parseISO(matchData.startTime).getTime()) {
            showToast("Oops! This match has started or is about to start.", "error");
            return;
        }
        const lockedSlotsCount = typeof matchData.lockedSlots === 'object' && matchData.lockedSlots !== null
            ? Object.keys(matchData.lockedSlots).length
            : (matchData.lockedSlots || 0);

        if (matchData.playerCapacity + matchData.bufferCapacity - matchData.bookedSlots - lockedSlotsCount <= 0) {
            showToast("Oops! This match is full.", "error");
            return;
        }

        setIsBooking(true);

        try {
            // API call to validate booking availability
            const response = await api.get(`/matches/${id}/booking-info`);
            if (response.status === 200 && response.data) {
                // Navigate to booking details page
                router.push(`/book-match/${id}`);
            } else {
                showToast("Unable to book this match. Please try again.", "error");
            }
        } catch (error) {
            showToast("Failed to validate booking. Please try again.", "error");
        } finally {
            setIsBooking(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
            </div>
        );
    }

    if (error || !matchData) {
        return (
            <div className="flex min-h-screen items-center justify-center text-white">
                <div className="text-center">
                    <p className="text-red-500">Failed to load match details</p>
                    <button onClick={handleBack} className="text-blue-500 mt-4 block">
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    const startTime = format(parseISO(matchData.startTime), "h:mm a");
    const endTime = format(parseISO(matchData.endTime), "h:mm a");
    const matchDate = parseISO(matchData.startTime);
    const durationMins = Math.round((parseISO(matchData.endTime).getTime() - parseISO(matchData.startTime).getTime()) / (1000 * 60));
    const reportTime = format(new Date(parseISO(matchData.startTime).getTime() - (15 * 60 * 1000)), "h:mm a");

    return (
        <div className="px-4 pb-20 h-full min-h-screen w-full overflow-x-hidden bg-background text-foreground antialiased"
            style={{
                backgroundImage: 'url(/hof-background.svg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Header */}
            <div className="w-full space-y-2">
                <div className="flex w-full items-center justify-between mt-2">
                    <div className="w-8">
                        <button onClick={handleBack}>
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex-1 text-center">
                        <div className="text-lg font-semibold">Match Details</div>
                    </div>
                    <div className="w-8">
                        <Share2 className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div className="mt-2 w-full h-64 rounded-lg overflow-hidden relative mx-auto">
                    <Image
                        src={matchData.venue.display_banner || "/play-dummy-venue.jpg"}
                        alt={matchData.venue.name}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-4 rounded-lg py-2">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold">{matchData.venue.name}</h1>
                        <p className="text-gray-400">{matchData.venue.address}</p>
                        {location && matchData.venue.latitude && matchData.venue.longitude && (
                            <p className="text-sm text-gray-400">
                                {calculateDistance(location, {
                                    latitude: matchData.venue.latitude,
                                    longitude: matchData.venue.longitude
                                })?.toFixed(1)} kms away
                            </p>
                        )}
                    </div>

                    {matchData.isFastFilling && (
                        <div className="inline-flex">
                            <span className="bg-orange-600/20 text-orange-500 px-3 py-1 rounded-full text-xs">
                                🔥 Fast Filling
                            </span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div>
                            <p className="text-gray-400 flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                {format(matchDate, "EEEE, MMMM d, yyyy")}
                            </p>
                            <p className="text-lg flex items-center">
                                <ClockIcon className="w-4 h-4 mr-2" />
                                {startTime} - {endTime} ({durationMins} mins)
                            </p>
                        </div>

                        <p className="text-sm text-gray-400 flex items-center">
                            <WatchIcon className="w-4 h-4 mr-2" />
                            Report to venue by {reportTime}
                        </p>
                    </div>

                    {/* Match Stats */}
                    {/* <div className="bg-gray-800/30 rounded-lg p-4">
                        <div className="text-sm font-medium mb-2">Match Capacity</div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-400">Total Capacity:</span>
                                <span className="ml-2 font-medium">
                                    {(matchData.playerCapacity || 0) + (matchData.bufferCapacity || 0)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400">Available Slots:</span>
                                <span className="ml-2 font-medium">
                                    {(matchData.playerCapacity || 0) + (matchData.bufferCapacity || 0) - (matchData.bookedSlots || 0) - (typeof matchData.lockedSlots === 'object' && matchData.lockedSlots !== null ? Object.keys(matchData.lockedSlots).length : (matchData.lockedSlots || 0))}
                                </span>
                            </div>
                        </div>
                    </div> */}

                    {/* Football Chief */}
                    {matchData.footballChief && (
                        <div className="space-y-2">
                            <p className="text-sm text-gray-400">Football Chief</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                                    {matchData.footballChief?.firstName?.charAt(0) + matchData.footballChief?.lastName?.charAt(0) || 'FC'}
                                </div>
                                <div>
                                    <p className="font-medium">{matchData.footballChief?.firstName + ' ' + matchData.footballChief?.lastName || 'Football Chief'}</p>
                                    <p className="text-sm text-gray-400 flex items-center">
                                        <PhoneIcon className="w-4 h-4 mr-2 cursor-pointer" onClick={() => window.open(`tel:${matchData.footballChief?.phoneNumber}`, '_blank')} />
                                        {matchData.footballChief?.phoneNumber || 'Contact info not available'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Book Slot Button */}
                    <div className="mt-auto fixed bottom-0 left-0 right-0 p-4">
                        <Button
                            disabled={isLoading || !matchData || matchData.playerCapacity + matchData.bufferCapacity - matchData.bookedSlots - (typeof matchData.lockedSlots === 'object' && matchData.lockedSlots !== null ? Object.keys(matchData.lockedSlots).length : (matchData.lockedSlots || 0)) <= 0 || isBooking}
                            className="w-full bg-green-600 text-white py-4 rounded-lg"
                            onClick={handleBookSlot}
                        >
                            {isBooking && (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white ml-2"></div>
                            )}
                            {(!matchData || matchData.playerCapacity + matchData.bufferCapacity - matchData.bookedSlots - (typeof matchData.lockedSlots === 'object' && matchData.lockedSlots !== null ? Object.keys(matchData.lockedSlots).length : (matchData.lockedSlots || 0)) <= 0) ? "This match is full" : "Book Slot(s)"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchDetailsPage;
