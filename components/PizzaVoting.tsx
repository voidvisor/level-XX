"use client";

import { useState } from "react";
import { submitPizzaVote } from "@/app/actions";
import { motion } from "framer-motion";

interface PizzaVotingProps {
    agentId: string;
    isPizzaVotingOpen: boolean;
    serverVote?: string | null;
    onRefresh?: () => Promise<void>;
}

const PIZZA_OPTIONS = [
    { id: "MARGHERITA", label: "THREE CHEESE MARGHERITA", description: "Tomato sauce, pizza cheese, mozzarella, parmesan, wild oregano" },
    { id: "ARTICHOKE_BUFFALO", label: "ARTICHOKE & BUFFALO MOZZARELLA", description: "Tomato sauce, mozzarella, artichokes, Buffalo mozzarella, Prosciutto crudo, basil, balsamic sauce" },
    { id: "PEPPERONI", label: "PEPPERONI", description: "Tomato sauce, mozzarella, salami pepperoni, wild oregano" },
    { id: "PEPPERONI_MUSHROOM", label: "PEPPERONI WITH MUSHROOMS", description: "Tomato sauce, mozzarella, salami pepperoni, mushrooms, olives, red onions, garlic, green onions, wild oregano" },
    { id: "SPICY_SALAMI", label: "SPICY SALAMI", description: "Tomato sauce, spicy salami, marinated jalapeno peppers, red onions, capers, wild oregano" },
    { id: "SPICY_MEATBALL", label: "SPICY MEATBALL", description: "Tomato sauce, mozzarella, minced meat balls, marinated jalapeno peppers, wild oregano" },
    { id: "BURGER_PIZZA", label: "BURGER PIZZA", description: "Tomato sauce, mozzarella, meat balls, french fries, green onions, wild oregano" },
    { id: "PROSCIUTTO_CRUDO", label: "PROSCIUTTO CRUDO", description: "Tomato sauce, mozzarella, parmesan, prosciutto crudo, fresh arugula, sun-dried tomatoes, wild oregano" },
    { id: "CAPRICCIOSA", label: "CAPRICCIOSA", description: "Tomato sauce, Cotto-boiled ham, grilled artichokes, olives, mushrooms, egg, wild oregano" },
    { id: "HAM_MUSHROOM", label: "HAM AND MUSHROOM", description: "Tomato sauce, mozzarella, Cotto-boiled ham, mushrooms, wild oregano" },
    { id: "PINEAPPLE_HAM", label: "PINEAPPLE AND HAM", description: "Tomato sauce, mozzarella, pineapple, Cotto-boiled ham, wild oregano" },
    { id: "BBQ_BACON", label: "BBQ BACON", description: "Tomato sauce, bbq sauce, mozzarella, bacon, onions, marinated cucumbers, mushrooms, dill, wild oregano" },
    { id: "PEAR_PROSCIUTTO", label: "PEAR AND PROSCIUTTO", description: "White melted cheese sauce, gorgonzola, pears, roasted walnuts, Parma ham, wild oregano" },
    { id: "CHICKEN_PESTO", label: "CHICKEN & PESTO", description: "White melted cheese sauce, gorgonzola, mozzarella, chicken fillet, pesto sauce, pine nuts, wild oregano" },
    { id: "CHICKEN_CURRY", label: "CHICKEN AND CURRY", description: "Tomato sauce, mozzarella, chicken fillet, tomato, onions, mango-curry sauce, sriracha sauce, cilantro, wild oregano" },
    { id: "CHICKEN_VEG", label: "CHICKEN & GRILLED VEGETABLES", description: "Tomato sauce, mozzarella, chicken fillet, paprika, zucchini, olives, wild oregano" },
    { id: "VEGETARIAN", label: "VEGETARIAN", description: "Tomato sauce, mozzarella, grilled paprika, grilled zucchini, olives, red onions, tomatoes, mushrooms, wild oregano" },
    { id: "ARUGULA_TOMATO", label: "ARUGULA AND TOMATO", description: "Tomato sauce, mozzarella, cherry tomatoes, arugula, pesto sauce, parmesan, wild oregano" },
    { id: "FOUR_CHEESE", label: "FOUR CHEESE", description: "Mozzarella, tallegio, gorgonzola, parmesan, wild oregano" },
    { id: "TIGER_PRAWN", label: "TIGER PRAWN", description: "Tomato sauce, mozzarella, tiger prawns, sun-dried tomatoes, arugula, pesto, parmesan, wild oregano" },
    { id: "BOLETUS_PROSCIUTTO", label: "BOLETUS PROSCIUTTO", description: "Prosciutto, boletus mushrooms, arugula, sun-dried tomatoes, tomato sauce, parmesan, wild oregano" },
    { id: "ANCHOVY", label: "ANCHOVY PIZZA", description: "Tomato sauce, pizza cheese, anchovies, red onions, capers, olives, fresh basil" },
];

export default function PizzaVoting({ agentId, isPizzaVotingOpen, serverVote, onRefresh }: PizzaVotingProps) {
    const [selectedOption, setSelectedOption] = useState<string | null>(serverVote || null);
    const [hasVoted, setHasVoted] = useState(!!serverVote);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync state with server data (Derived State Pattern)
    if (serverVote && selectedOption !== serverVote) {
        setSelectedOption(serverVote);
    }
    if (serverVote && !hasVoted) {
        setHasVoted(true);
    }
    if (!serverVote && !isSubmitting) {
        if (selectedOption !== null) setSelectedOption(null);
        if (hasVoted) setHasVoted(false);
    }

    const handleVote = async (optionId: string) => {
        if (!isPizzaVotingOpen) return;

        setIsSubmitting(true);
        const result = await submitPizzaVote(agentId, optionId);

        if (result.success) {
            setSelectedOption(optionId);
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

    if (!isPizzaVotingOpen) {
        return (
            <div className="border border-red-500/50 p-4 bg-red-900/10 text-center">
                <p className="text-red-500 font-mono text-sm">RATION VOTING OFFLINE</p>
            </div>
        );
    }

    if (hasVoted) {
        return (
            <div className="border border-green-500 p-6 bg-green-900/20 text-center animate-pulse">
                <h3 className="text-xl font-bold text-green-500 mb-2">RATION PREFERENCE LOGGED</h3>
                <p className="font-mono text-sm opacity-80">
                    SELECTION: {PIZZA_OPTIONS.find(o => o.id === selectedOption)?.label}
                </p>
                <p className="text-xs mt-4 opacity-50">AWAITING DEPLOYMENT</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-center text-green-500 font-bold border-b border-green-500/30 pb-2">
                SELECT RATION PREFERENCE
            </h3>
            <div className="grid grid-cols-1 gap-3">
                {PIZZA_OPTIONS.map((option) => (
                    <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleVote(option.id)}
                        disabled={isSubmitting}
                        className="p-4 border border-green-500/50 hover:bg-green-500/20 hover:border-green-500 transition-all text-left group"
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-green-400 group-hover:text-green-300">
                                {option.label}
                            </span>
                            {isSubmitting && selectedOption === option.id && (
                                <span className="animate-spin">⟳</span>
                            )}
                        </div>
                        <div className="text-xs text-green-500/60 mt-1 font-mono">
                            {option.description}
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
