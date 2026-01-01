import { prisma } from "@/lib/prisma";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    const agents = await prisma.agent.findMany({
        orderBy: { updatedAt: "desc" },
    });

    const state = await prisma.systemState.findFirst({
        orderBy: { updatedAt: 'desc' },
    });

    return (
        <AdminDashboard
            agents={agents}
            currentStage={state?.currentStage ?? 0}
            isVotingOpen={state?.isVotingOpen ?? false}
            showBombManual={state?.showBombManual ?? false}
            isPizzaVotingOpen={state?.isPizzaVotingOpen ?? false}
        />
    );
}
