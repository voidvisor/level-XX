import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const agentId = searchParams.get("agentId");

        // Fetch the singleton SystemState. If it doesn't exist, create it.
        let state = await prisma.systemState.findFirst({
            orderBy: { updatedAt: 'desc' },
        });

        if (!state) {
            state = await prisma.systemState.create({
                data: {
                    currentStage: 0,
                },
            });
        }

        let agentData = {};
        if (agentId) {
            const agent = await prisma.agent.findUnique({
                where: { id: agentId },
                select: { vote: true, pizzaVote: true }
            });
            if (agent) {
                agentData = {
                    myVote: agent.vote,
                    myPizzaVote: agent.pizzaVote
                };
            }
        }

        return NextResponse.json({
            currentStage: state.currentStage,
            isVotingOpen: state.isVotingOpen,
            showBombManual: state.showBombManual,

            isPizzaVotingOpen: state.isPizzaVotingOpen,
            serverTime: Date.now(),
            ...agentData
        });
    } catch (error) {
        console.error("Failed to fetch system state:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
