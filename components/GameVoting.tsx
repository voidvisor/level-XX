"use client";

import { useState } from "react";
import { submitVote } from "@/app/actions";
import { motion } from "framer-motion";

interface GameVotingProps {
    agentId: string;
    isVotingOpen: boolean;
    serverVote?: string | null;
    onRefresh?: () => Promise<void>;
}

export const GAMES = [
    { id: "TRIPLE_AGENT", name: "TRIPLE AGENT" },
    { id: "KEEP_TALKING", name: "KEEP TALKING AND NOBODY EXPLODES" },
    { id: "QUIPLASH", name: "QUIPLASH 3" },
    { id: "TRIVIA_MURDER_PARTY", name: "TRIVIA MURDER PARTY 2" }
];

export default function GameVoting({ agentId, isVotingOpen, serverVote, onRefresh }: GameVotingProps) {
    const [selectedGame, setSelectedGame] = useState<string | null>(serverVote || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasVoted, setHasVoted] = useState(!!serverVote);

    // Sync state with server data (Derived State Pattern)
    if (serverVote && selectedGame !== serverVote) {
        setSelectedGame(serverVote);
    }
    if (serverVote && !hasVoted) {
        setHasVoted(true);
    }
    if (!serverVote && !isSubmitting) {
        if (selectedGame !== null) setSelectedGame(null);
        if (hasVoted) setHasVoted(false);
    }

    const handleVote = async (gameId: string) => {
        if (!isVotingOpen || isSubmitting || hasVoted) return;

        setIsSubmitting(true);
        const result = await submitVote(agentId, gameId);

        if (result.success) {
            // Optimistic update
            setSelectedGame(gameId);
            setHasVoted(true);

            // Trigger immediate refresh
            if (onRefresh) {
                await onRefresh();
            }
        } else {
            alert("VOTE TRANSMISSION FAILED");
        }
        setIsSubmitting(false);
    };

    if (!isVotingOpen) {
        return (
            <div className="text-center p-6 border border-red-500 bg-red-900/10" style={{ '--glitch-bg': '#10110b' } as React.CSSProperties}>
                <h3 className="text-xl font-bold text-red-500 mb-2 glitch-effect" data-text="VOTING OFFLINE">
                    VOTING OFFLINE
                </h3>
                <p className="text-sm opacity-70 font-mono">
                    AWAITING ADMIN AUTHORIZATION
                </p>
            </div>
        );
    }

    if (hasVoted) {
        return (
            <div className="text-center p-6 border border-green-500 bg-green-900/20 animate-pulse" style={{ '--glitch-bg': '#051f10' } as React.CSSProperties}>
                <h3 className="text-xl font-bold text-green-400 mb-4 glitch-effect" data-text="VOTE REGISTERED">
                    VOTE REGISTERED
                </h3>
                <p className="text-lg font-mono mb-2">
                    {GAMES.find(g => g.id === selectedGame)?.name}
                </p>
                <p className="text-xs opacity-70 mt-4">
                    AWAITING FINAL TALLY
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-center text-xl font-bold text-green-400 mb-6">SELECT MISSION PARAMETERS</h3>
            <div className="grid gap-4">
                {GAMES.map((game) => (
                    <motion.button
                        key={game.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleVote(game.id)}
                        disabled={isSubmitting}
                        className="p-4 border border-green-500/50 hover:bg-green-500/20 hover:border-green-500 transition-all text-left group"
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-green-400 group-hover:text-green-300 font-mono">
                                {game.name}
                            </span>
                            {isSubmitting && selectedGame === game.id && (
                                <span className="animate-spin">⟳</span>
                            )}
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
