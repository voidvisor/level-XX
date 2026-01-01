"use client";

import { useState, useEffect } from "react";
import { useMissionState } from "@/hooks/useMissionState";

export default function CountdownTimer({ initialTransportMode }: { initialTransportMode?: string | null }) {
    const { serverTime } = useMissionState();
    const [offset, setOffset] = useState<number>(0);

    useEffect(() => {
        if (serverTime) {
            const clientTime = Date.now();
            setOffset(serverTime - clientTime);
        }
    }, [serverTime]);

    const calculateTimeLeft = () => {
        const targetDate = new Date("2025-12-18T12:45:00+02:00").getTime();
        const now = Date.now() + offset;
        const distance = targetDate - now;

        if (distance < 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        return {
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
        };
    };

    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);

    useEffect(() => {
        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(interval);
    }, [offset]);

    if (!timeLeft) {
        return (
            <div className="text-center mt-6 p-4 border border-green-500/50 bg-green-900/10">
                <p className="text-green-500 animate-pulse">SYNCHRONIZING...</p>
            </div>
        );
    }

    const isFinished = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

    if (isFinished) {
        return <LocationRevealedView initialTransportMode={initialTransportMode} />;
    }

    return (
        <div className="text-center mt-6 p-4 border border-green-500/50 bg-green-900/10" style={{ '--glitch-bg': '#010804' } as React.CSSProperties}>
            <h3 className="text-sm font-bold text-green-500 mb-2 tracking-widest">LOCATION REVEAL IN</h3>
            <div className="grid grid-cols-4 gap-2 text-green-100 font-mono">
                <div className="flex flex-col">
                    <span className="text-2xl font-bold glitch-effect" data-text={timeLeft.days}>{timeLeft.days}</span>
                    <span className="text-[10px] opacity-70">DAYS</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-bold glitch-effect" data-text={timeLeft.hours}>{timeLeft.hours}</span>
                    <span className="text-[10px] opacity-70">HRS</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-bold glitch-effect" data-text={timeLeft.minutes}>{timeLeft.minutes}</span>
                    <span className="text-[10px] opacity-70">MIN</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-bold glitch-effect" data-text={timeLeft.seconds}>{timeLeft.seconds}</span>
                    <span className="text-[10px] opacity-70">SEC</span>
                </div>
            </div>
            <div className="mt-2 text-[10px] text-green-500/50">
                TARGET: XX.XX.2025 XX:XX (LOCATION)
            </div>
        </div>
    );
}

function LocationRevealedView({ initialTransportMode }: { initialTransportMode?: string | null }) {
    const [meetingTimeLeft, setMeetingTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);
    const [transportMode, setTransportMode] = useState(initialTransportMode || "");
    const [pickupLocation, setPickupLocation] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(!!initialTransportMode);

    useEffect(() => {
        // Target: December 20, 2025 12:45:00 Riga Time (UTC+2) - Meeting time
        const targetDate = new Date("2025-12-20T12:45:00+02:00").getTime();

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
            };
        };

        setMeetingTimeLeft(calculateTimeLeft());
        const interval = setInterval(() => {
            setMeetingTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // We need the agent ID here. Since we don't have it in props, we'll need to get it from the URL or context.
        // For now, let's assume the parent component handles this or we extract it from the URL.
        const urlParams = new URLSearchParams(window.location.search);
        const agentId = urlParams.get('id');

        if (agentId) {
            const { submitTransportDetails } = await import("@/app/actions");
            const result = await submitTransportDetails(agentId, transportMode, pickupLocation);
            if (result.success) {
                setIsSubmitted(true);
            }
        }
        setIsSubmitting(false);
    };

    return (
        <div className="mt-6 space-y-6">
            {/* Location Reveal */}
            <div className="text-center p-4 border border-green-500 bg-green-900/20 animate-pulse" style={{ '--glitch-bg': '#031109' } as React.CSSProperties}>
                <h3 className="text-xl font-bold text-green-400 mb-2 glitch-effect" data-text="LOCATION REVEALED">LOCATION REVEALED</h3>
                <p className="text-lg font-mono mb-2">MEETING POINT ESTABLISHED</p>
                <div className="border border-green-500/50 p-2 inline-block bg-black">
                    <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-2xl font-bold text-white">XX.XXXX, XX.XXXX</a>
                </div>
                <p className="text-xs mt-2 opacity-70">PREPARE FOR EXTRACTION</p>
            </div>

            {/* Meeting Timer */}
            {meetingTimeLeft && (
                <div className="text-center p-4 border border-green-500/50 bg-green-900/10">
                    <h3 className="text-sm font-bold text-green-500 mb-2 tracking-widest">EXTRACTION IN</h3>
                    <div className="grid grid-cols-4 gap-2 text-green-100 font-mono">
                        <div className="flex flex-col">
                            <span className="text-xl font-bold">{meetingTimeLeft.days}</span>
                            <span className="text-[10px] opacity-70">DAYS</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold">{meetingTimeLeft.hours}</span>
                            <span className="text-[10px] opacity-70">HRS</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold">{meetingTimeLeft.minutes}</span>
                            <span className="text-[10px] opacity-70">MIN</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold">{meetingTimeLeft.seconds}</span>
                            <span className="text-[10px] opacity-70">SEC</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Transport Form */}
            {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="border border-green-500 p-4 bg-black/80">
                    <h3 className="text-lg font-bold text-green-500 mb-4 text-center">LOGISTICS</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-1 text-sm">TRANSPORT MODE</label>
                            <select
                                value={transportMode}
                                onChange={(e) => setTransportMode(e.target.value)}
                                className="w-full bg-black border border-green-500 p-2 text-green-500 focus:outline-none focus:ring-1 focus:ring-green-400"
                                required
                            >
                                <option value="">SELECT OPTION</option>
                                <option value="PUBLIC">PUBLIC TRANSPORT</option>
                                <option value="PRIVATE">PRIVATE VEHICLE</option>
                                <option value="RIDE_REQUEST">REQUEST EXTRACTION (RIDE)</option>
                            </select>
                        </div>

                        {transportMode === "RIDE_REQUEST" && (
                            <div>
                                <label className="block mb-1 text-sm">PICKUP LOCATION</label>
                                <input
                                    type="text"
                                    value={pickupLocation}
                                    onChange={(e) => setPickupLocation(e.target.value)}
                                    placeholder="ENTER ADDRESS"
                                    className="w-full bg-black border border-green-500 p-2 text-green-500 focus:outline-none focus:ring-1 focus:ring-green-400"
                                    required
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-green-900 hover:bg-green-800 text-green-100 p-2 font-bold border border-green-500 transition-colors"
                        >
                            {isSubmitting ? "TRANSMITTING..." : "CONFIRM LOGISTICS"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="text-center p-4 border border-green-500 bg-green-900/20">
                    <p className="text-green-400 font-bold">LOGISTICS CONFIRMED</p>
                    {pickupLocation && <p className="text-xs opacity-70 mt-1">STAND BY FOR INSTRUCTIONS</p>}
                </div>
            )}
        </div>
    );
}
