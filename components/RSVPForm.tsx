"use client";

import { useState } from "react";
import { submitRSVP } from "@/app/actions";
import { Status } from "@prisma/client";
import CountdownTimer from "./CountdownTimer";

export default function RSVPForm({ agentId, initialStatus, initialTransportMode }: { agentId: string, initialStatus?: string | null, initialTransportMode?: string | null }) {
    const [codename, setCodename] = useState("");
    const [status, setStatus] = useState<Status>((initialStatus === "PENDING" || !initialStatus) ? "CONFIRMED" : initialStatus as Status);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCountdown, setShowCountdown] = useState(initialStatus === "CONFIRMED");
    const [isMIA, setIsMIA] = useState(initialStatus === "MIA");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const result = await submitRSVP(agentId, codename, status);
        setIsSubmitting(false);

        if (result.success) {
            setMessage("TRANSMISSION RECEIVED");
            setCodename("");
            if (status === "CONFIRMED") {
                setShowCountdown(true);
                setIsMIA(false);
            } else {
                setShowCountdown(false);
                setIsMIA(true);
            }
        } else {
            setMessage("TRANSMISSION FAILED");
        }
    };

    if (isMIA) {
        return (
            <div className="border-2 border-red-500 p-4 max-w-md mx-auto mt-8 bg-black/80">
                <h2 className="text-2xl font-bold mb-4 text-center glitch-effect text-red-500" data-text="STATUS: MIA">
                    STATUS: MIA
                </h2>
                <p className="text-center text-red-400 mb-4">
                    ACKNOWLEDGED. STAND DOWN, AGENT.
                </p>
                <div className="text-center text-xs opacity-50 font-mono">
                    <p>COMMUNICATION TERMINATED</p>
                </div>
            </div>
        );
    }

    if (showCountdown) {
        return (
            <div className="border-2 border-green-500 p-4 max-w-md mx-auto mt-8 bg-black/80">
                <h2 className="text-2xl font-bold mb-4 text-center glitch-effect" data-text="ACCESS GRANTED">
                    ACCESS GRANTED
                </h2>
                <p className="text-center text-green-500 mb-4 animate-pulse">
                    WELCOME TO THE MISSION, AGENT.
                </p>
                <CountdownTimer initialTransportMode={initialTransportMode} />
            </div>
        );
    }

    return (
        <div className="border-2 border-green-500 p-4 max-w-md mx-auto mt-8 bg-black/80">
            <h2 className="text-2xl font-bold mb-4 text-center glitch-effect" data-text="AGENT CHECK-IN">
                AGENT CHECK-IN
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1">CODENAME</label>
                    <input
                        type="text"
                        value={codename}
                        onChange={(e) => setCodename(e.target.value)}
                        className="w-full bg-black border border-green-500 p-2 text-green-500 focus:outline-none focus:ring-1 focus:ring-green-400"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1">STATUS</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as Status)}
                        className="w-full bg-black border border-green-500 p-2 text-green-500 focus:outline-none focus:ring-1 focus:ring-green-400"
                    >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="MIA">MIA</option>
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-green-900 hover:bg-green-800 text-green-100 p-2 font-bold border border-green-500 transition-colors"
                >
                    {isSubmitting ? "TRANSMITTING..." : "SEND TRANSMISSION"}
                </button>
                {message && <p className="text-center mt-2 animate-pulse">{message}</p>}
            </form>
        </div>
    );
}
