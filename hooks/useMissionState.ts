import useSWR from "swr";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    // If the status code is not in the range 200-299,
    // we still try to parse and throw it.
    if (!res.ok) {
        const error = new Error("An error occurred while fetching the data.");
        // Attach extra info to the error object.
        (error as Error & { info?: unknown; status?: number }).info = await res.json();
        (error as Error & { info?: unknown; status?: number }).status = res.status;
        throw error;
    }
    return res.json();
};

export function useMissionState(agentId?: string) {
    const { data, error, isLoading, mutate } = useSWR(
        agentId ? `/api/sync?agentId=${agentId}` : "/api/sync",
        fetcher,
        {
            refreshInterval: 5000, // Poll every 5 seconds
            revalidateOnFocus: true,
            shouldRetryOnError: true,
        }
    );

    return {
        currentStage: data?.currentStage ?? 0,
        isVotingOpen: data?.isVotingOpen ?? false,
        showBombManual: data?.showBombManual ?? false,

        isPizzaVotingOpen: data?.isPizzaVotingOpen ?? false,
        myVote: data?.myVote ?? null,
        myPizzaVote: data?.myPizzaVote ?? null,
        serverTime: data?.serverTime ?? null,
        isLoading,
        isError: error || data?.error,
        mutate, // Expose mutate for immediate refresh
    };
}
