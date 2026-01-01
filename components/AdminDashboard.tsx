"use client";

import { useState } from "react";
import { updateStage, verifyPin, toggleVoting, togglePizzaVoting, toggleResource, sendNotification } from "@/app/actions";
import { Agent } from "@prisma/client";
import { QRCodeSVG } from "qrcode.react";
import { GAMES } from "./GameVoting";

interface AdminDashboardProps {
    agents: Agent[];
    currentStage: number;
    isVotingOpen: boolean;
    showBombManual: boolean;
    isPizzaVotingOpen: boolean;
}

export default function AdminDashboard({
    agents,
    currentStage,
    isVotingOpen,
    showBombManual,
    isPizzaVotingOpen
}: AdminDashboardProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [newRealName, setNewRealName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [isTogglingVoting, setIsTogglingVoting] = useState(false);
    const [isTogglingPizzaVoting, setIsTogglingPizzaVoting] = useState(false);
    const [isTogglingResource, setIsTogglingResource] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");
    const [isSendingNotification, setIsSendingNotification] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await verifyPin(pin);
        if (result.success) {
            setIsAuthenticated(true);
            setError("");
        } else {
            setError("ACCESS DENIED");
        }
    };

    const handleStageChange = async (stage: number) => {
        await updateStage(stage);
    };

    const handleToggleVoting = async () => {
        if (confirm(isVotingOpen ? "CLOSE VOTING?" : "OPEN VOTING? (THIS WILL RESET ALL VOTES)")) {
            setIsTogglingVoting(true);
            await toggleVoting(!isVotingOpen);
            setIsTogglingVoting(false);
        }
    };

    const handleTogglePizzaVoting = async () => {
        if (confirm(isPizzaVotingOpen ? "CLOSE RATION VOTING?" : "OPEN RATION VOTING? (THIS WILL RESET ALL VOTES)")) {
            setIsTogglingPizzaVoting(true);
            await togglePizzaVoting(!isPizzaVotingOpen);
            setIsTogglingPizzaVoting(false);
        }
    };

    const handleToggleResource = async (resource: 'bomb', currentState: boolean) => {
        setIsTogglingResource(true);
        await toggleResource(resource, !currentState);
        setIsTogglingResource(false);
    };

    const handleCreateAgent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        const { createAgent } = await import("@/app/actions");
        const result = await createAgent(newRealName);
        setIsCreating(false);
        if (result.success) {
            setNewRealName("");
        } else {
            alert("Failed to create agent");
        }
    };

    const handleDeleteAgent = async (agentId: string) => {
        if (confirm("ARE YOU SURE YOU WANT TO TERMINATE THIS AGENT IDENTITY?")) {
            const { deleteAgent } = await import("@/app/actions");
            await deleteAgent(agentId);
        }
    };

    const handleSendNotification = async () => {
        if (!notificationMessage) return;
        setIsSendingNotification(true);
        await sendNotification(notificationMessage);
        setNotificationMessage("");
        setIsSendingNotification(false);
        alert("Notification sent!");
    };

    const voteCounts = agents.reduce((acc, agent) => {
        if (agent.vote) {
            acc[agent.vote] = (acc[agent.vote] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const pizzaVoteCounts = agents.reduce((acc, agent) => {
        if (agent.pizzaVote) {
            acc[agent.pizzaVote] = (acc[agent.pizzaVote] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-green-500 font-mono">
                <form onSubmit={handleLogin} className="border border-green-500 p-8 rounded bg-green-900/10">
                    <h1 className="text-2xl mb-4 text-center">SECURITY CLEARANCE</h1>
                    <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="ENTER PIN"
                        className="w-full bg-black border border-green-500 p-2 mb-4 text-center focus:outline-none focus:ring-1 focus:ring-green-400"
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-green-900 hover:bg-green-800 text-green-100 p-2 font-bold border border-green-500"
                    >
                        AUTHENTICATE
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 bg-black text-green-500 font-mono">
            <header className="flex justify-between items-center mb-8 border-b border-green-500 pb-4">
                <h1 className="text-3xl font-bold">MISSION CONTROL</h1>
                <div className="text-right">
                    <p>CURRENT STAGE: <span className="text-white font-bold">{currentStage}</span></p>
                    <p className="text-xs opacity-70">ADMIN ACCESS GRANTED</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Stage Controls */}
                <section className="border border-green-500 p-6 bg-green-900/10">
                    <h2 className="text-xl font-bold mb-6 border-b border-green-500/50 pb-2">STAGE CONTROL</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {[0, 1, 2, 3].map((stage) => (
                            <button
                                key={stage}
                                onClick={() => handleStageChange(stage)}
                                className={`p-8 text-2xl font-bold border transition-all ${currentStage === stage
                                    ? "bg-green-500 text-black border-green-500 shadow-[0_0_20px_rgba(0,255,65,0.5)]"
                                    : "bg-black text-green-500 border-green-500 hover:bg-green-900/30"
                                    }`}
                            >
                                STAGE {stage}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Notification Control */}
                <section className="border border-green-500 p-6 bg-green-900/10">
                    <h2 className="text-xl font-bold mb-6 border-b border-green-500/50 pb-2">BROADCAST MESSAGE</h2>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={notificationMessage}
                            onChange={(e) => setNotificationMessage(e.target.value)}
                            placeholder="ENTER MESSAGE TO BROADCAST"
                            className="flex-1 bg-black border border-green-500 p-2 focus:outline-none focus:ring-1 focus:ring-green-400"
                        />
                        <button
                            onClick={handleSendNotification}
                            disabled={isSendingNotification || !notificationMessage}
                            className="bg-green-900/20 hover:bg-green-900/40 border border-green-500 px-6 py-2 transition-colors disabled:opacity-50"
                        >
                            {isSendingNotification ? "SENDING..." : "BROADCAST"}
                        </button>
                    </div>
                </section>

                {/* Resource Controls */}
                <section className="border border-green-500 p-6 bg-green-900/10">
                    <h2 className="text-xl font-bold mb-6 border-b border-green-500/50 pb-2">RESOURCE CONTROL</h2>
                    <div className="space-y-4">
                        <div className="grid gap-4">
                            <button
                                onClick={() => handleToggleResource('bomb', showBombManual)}
                                disabled={isTogglingResource}
                                className={`p-4 font-bold border transition-all ${showBombManual
                                    ? "bg-green-500 text-black border-green-500"
                                    : "bg-black text-green-500 border-green-500 hover:bg-green-900/30"
                                    }`}
                            >
                                {showBombManual ? "HIDE BOMB MANUAL" : "SHOW BOMB MANUAL"}
                            </button>

                        </div>
                    </div>
                </section>

                {/* Voting Control */}
                <section className="border border-green-500 p-6 bg-green-900/10">
                    <h2 className="text-xl font-bold mb-6 border-b border-green-500/50 pb-2">GAME VOTING</h2>
                    <div className="space-y-6">
                        <button
                            onClick={handleToggleVoting}
                            disabled={isTogglingVoting}
                            className={`w-full p-4 text-xl font-bold border transition-all ${isVotingOpen
                                ? "bg-green-500 text-black border-green-500"
                                : "bg-red-900/20 text-red-500 border-red-500 hover:bg-red-900/40"
                                }`}
                        >
                            {isTogglingVoting ? "PROCESSING..." : isVotingOpen ? "VOTING OPEN (CLICK TO CLOSE)" : "VOTING CLOSED (CLICK TO OPEN)"}
                        </button>

                        {isVotingOpen && (
                            <div className="grid grid-cols-3 gap-2 text-center">
                                {GAMES.map((game) => (
                                    <div className="p-2 border border-green-500/30">
                                        <div className="text-xs opacity-70">{game.name}</div>
                                        <div className="text-xl font-bold">{voteCounts[game.id] || 0}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Pizza Voting Control */}
                <section className="border border-green-500 p-6 bg-green-900/10">
                    <h2 className="text-xl font-bold mb-6 border-b border-green-500/50 pb-2">RATION VOTING</h2>
                    <div className="space-y-6">
                        <button
                            onClick={handleTogglePizzaVoting}
                            disabled={isTogglingPizzaVoting}
                            className={`w-full p-4 text-xl font-bold border transition-all ${isPizzaVotingOpen
                                ? "bg-green-500 text-black border-green-500"
                                : "bg-red-900/20 text-red-500 border-red-500 hover:bg-red-900/40"
                                }`}
                        >
                            {isTogglingPizzaVoting ? "PROCESSING..." : isPizzaVotingOpen ? "VOTING OPEN (CLICK TO CLOSE)" : "VOTING CLOSED (CLICK TO OPEN)"}
                        </button>

                        {isPizzaVotingOpen && (
                            <div className="grid grid-cols-2 gap-2 text-center">
                                {Object.entries(pizzaVoteCounts).map(([vote, count]) => (
                                    <div key={vote} className="p-2 border border-green-500/30">
                                        <div className="text-xs opacity-70">{vote}</div>
                                        <div className="text-xl font-bold">{count}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Create Agent */}
                <section className="border border-green-500 p-6 bg-green-900/10">
                    <h2 className="text-xl font-bold mb-6 border-b border-green-500/50 pb-2">NEW AGENT</h2>
                    <form onSubmit={handleCreateAgent} className="space-y-4">
                        <div>
                            <label className="block text-xs mb-1">REAL NAME</label>
                            <input
                                type="text"
                                value={newRealName}
                                onChange={(e) => setNewRealName(e.target.value)}
                                className="w-full bg-black border border-green-500 p-2 focus:outline-none focus:ring-1 focus:ring-green-400"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="w-full bg-green-900 hover:bg-green-800 text-green-100 p-2 font-bold border border-green-500"
                        >
                            {isCreating ? "ENCRYPTING..." : "GENERATE IDENTITY"}
                        </button>
                    </form>
                </section>

                {/* Agent Roster */}
                <section className="border border-green-500 p-6 bg-green-900/10 lg:col-span-2">
                    <h2 className="text-xl font-bold mb-6 border-b border-green-500/50 pb-2">AGENT ROSTER ({agents.length})</h2>
                    <div className="overflow-y-auto max-h-[500px]">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-green-500/30 text-sm opacity-70">
                                    <th className="pb-2">REAL NAME</th>
                                    <th className="pb-2">CODENAME</th>
                                    <th className="pb-2">STATUS</th>
                                    <th className="pb-2">TRANSPORT</th>
                                    <th className="pb-2">PICKUP</th>
                                    <th className="pb-2">GAME</th>
                                    <th className="pb-2">PIZZA</th>
                                    <th className="pb-2">ACCESS</th>
                                    <th className="pb-2">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agents.map((agent) => (
                                    <tr key={agent.id} className="border-b border-green-500/10 hover:bg-green-900/20">
                                        <td className="py-3">{agent.realName || "UNKNOWN"}</td>
                                        <td className="py-3 font-bold">{agent.codename}</td>
                                        <td className="py-3">
                                            <span
                                                className={`px-2 py-1 text-xs rounded ${agent.status === "CONFIRMED"
                                                    ? "bg-green-900/50 text-green-300 border border-green-500/50"
                                                    : agent.status === "PENDING"
                                                        ? "bg-yellow-900/50 text-yellow-300 border border-yellow-500/50"
                                                        : "bg-red-900/50 text-red-300 border border-red-500/50"
                                                    }`}
                                            >
                                                {agent.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-sm">{agent.transportMode || "-"}</td>
                                        <td className="py-3 text-sm">{agent.pickupLocation || "-"}</td>
                                        <td className="py-3 text-sm font-mono">{agent.vote || "-"}</td>
                                        <td className="py-3 text-sm font-mono">{agent.pizzaVote || "-"}</td>
                                        <td className="py-3">
                                            <button
                                                onClick={() => setSelectedAgentId(selectedAgentId === agent.id ? null : agent.id)}
                                                className="text-xs border border-green-500 px-2 py-1 hover:bg-green-500 hover:text-black transition-colors"
                                            >
                                                {selectedAgentId === agent.id ? "HIDE QR" : "SHOW QR"}
                                            </button>
                                            {selectedAgentId === agent.id && (
                                                <div className="mt-2 p-2 bg-white inline-block text-center">
                                                    <QRCodeSVG
                                                        value={`${process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/?id=${agent.id}`}
                                                        size={128}
                                                    />
                                                    <div className="mt-1 text-black text-[10px] max-w-[128px] break-all font-sans select-all">
                                                        {`${process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/?id=${agent.id}`}
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3">
                                            <button
                                                onClick={() => handleDeleteAgent(agent.id)}
                                                className="text-xs border border-red-500 text-red-500 px-2 py-1 hover:bg-red-500 hover:text-black transition-colors"
                                            >
                                                DELETE
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {agents.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="py-8 text-center opacity-50">
                                            NO AGENTS DETECTED
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}
