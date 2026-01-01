"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Status } from "@prisma/client";
import webPush from "web-push";

interface PushSubscriptionKeys {
    p256dh: string;
    auth: string;
}

interface PushSubscription {
    endpoint: string;
    keys: PushSubscriptionKeys;
}

export async function submitRSVP(agentId: string, codename: string, status: Status) {
    try {
        await prisma.agent.update({
            where: { id: agentId },
            data: { codename, status },
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Failed to submit RSVP:", error);
        return { success: false, error: "Failed to submit RSVP" };
    }
}

export async function submitTransportDetails(agentId: string, transportMode: string, pickupLocation?: string) {
    try {
        await prisma.agent.update({
            where: { id: agentId },
            data: { transportMode, pickupLocation },
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Failed to submit transport details:", error);
        return { success: false, error: "Failed to submit transport details" };
    }
}

export async function updateStage(stage: number) {
    try {
        // Ensure stage is within bounds (0-3)
        if (stage < 0 || stage > 3) {
            throw new Error("Invalid stage");
        }

        const state = await prisma.systemState.findFirst({
            orderBy: { updatedAt: 'desc' },
        });

        if (state) {
            await prisma.systemState.update({
                where: { id: state.id },
                data: { currentStage: stage },
            });
        } else {
            await prisma.systemState.create({
                data: { currentStage: stage },
            });
        }

        // Send notification (fire and forget / non-blocking for UI)
        let message = "";
        if (stage === 1) message = "SAFE HOUSE LOCATED. CHECK YOUR DEVICE.";
        if (stage === 2) message = "OPS CENTER ACTIVE. AWAITING INPUT.";

        if (message) {
            try {
                await sendNotification(message);
            } catch (notificationError) {
                console.error("Failed to send stage notification (non-fatal):", notificationError);
            }
        }

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Failed to update stage:", error);
        return { success: false, error: "Failed to update stage" };
    }
}

export async function verifyPin(pin: string) {
    const correctPin = process.env.ADMIN_PIN;
    return { success: pin === correctPin };
}

export async function verifyAgent(id: string) {
    try {
        const agent = await prisma.agent.findUnique({
            where: { id },
        });
        if (agent) {
            return {
                success: true,
                codename: agent.codename,
                status: agent.status,
                transportMode: agent.transportMode,
                vote: agent.vote,
                pizzaVote: agent.pizzaVote
            };
        }
        return { success: false };
    } catch (error) {
        console.error("Failed to verify agent:", error);
        return { success: false };
    }
}

export async function createAgent(realName: string) {
    try {
        // Generate a temporary unique codename
        const tempCodename = `RECRUIT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const agent = await prisma.agent.create({
            data: {
                realName,
                codename: tempCodename,
                status: "PENDING",
            },
        });
        revalidatePath("/admin");
        return { success: true, agent };
    } catch (error) {
        console.error("Failed to create agent:", error);
        return { success: false, error: "Failed to create agent" };
    }
}

export async function deleteAgent(agentId: string) {
    try {
        await prisma.agent.delete({
            where: { id: agentId },
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete agent:", error);
        return { success: false, error: "Failed to delete agent" };
    }
}

export async function submitVote(agentId: string, vote: string) {
    try {
        await prisma.agent.update({
            where: { id: agentId },
            data: { vote },
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Failed to submit vote:", error);
        return { success: false, error: "Failed to submit vote" };
    }
}

export async function toggleVoting(isOpen: boolean) {
    try {
        // Update system state
        const state = await prisma.systemState.findFirst({
            orderBy: { updatedAt: 'desc' },
        });

        if (state) {
            await prisma.systemState.update({
                where: { id: state.id },
                data: { isVotingOpen: isOpen },
            });
        }

        // If opening voting, clear all existing votes
        if (isOpen) {
            await prisma.agent.updateMany({
                data: { vote: null },
            });
        }

        revalidatePath("/admin");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle voting:", error);
        return { success: false, error: "Failed to toggle voting" };
    }
}

export async function toggleResource(resource: 'bomb', isActive: boolean) {
    try {
        const updateData: Record<string, boolean> = {};
        if (resource === 'bomb') updateData.showBombManual = isActive;

        await prisma.systemState.updateMany({
            data: updateData,
        });

        revalidatePath("/admin");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle resource:", error);
        return { success: false, error: "Failed to toggle resource" };
    }
}

export async function togglePizzaVoting(isOpen: boolean) {
    try {
        // Update system state
        const state = await prisma.systemState.findFirst({
            orderBy: { updatedAt: 'desc' },
        });

        if (state) {
            await prisma.systemState.update({
                where: { id: state.id },
                data: { isPizzaVotingOpen: isOpen },
            });
        }

        // If opening voting, clear all existing pizza votes
        if (isOpen) {
            await prisma.agent.updateMany({
                data: { pizzaVote: null },
            });
        }

        revalidatePath("/admin");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle pizza voting:", error);
        return { success: false, error: "Failed to toggle pizza voting" };
    }
}

export async function submitPizzaVote(agentId: string, vote: string) {
    try {
        await prisma.agent.update({
            where: { id: agentId },
            data: { pizzaVote: vote },
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Failed to submit pizza vote:", error);
        return { success: false, error: "Failed to submit pizza vote" };
    }
}

// Push Notifications

export async function saveSubscription(subscription: PushSubscription, agentId?: string) {
    try {
        await prisma.pushSubscription.create({
            data: {
                endpoint: subscription.endpoint,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                keys: subscription.keys as any,
                agentId: agentId || null,
            },
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to save subscription:", error);
        return { success: false, error: "Failed to save subscription" };
    }
}

export async function sendNotification(message: string, title: string = "LEVEL XX") {
    try {
        console.log(`[Notification] Sending "${title}: ${message}"...`);

        webPush.setVapidDetails(
            "mailto:admin@example.com",
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
            process.env.VAPID_PRIVATE_KEY!
        );

        const subscriptions = await prisma.pushSubscription.findMany();
        console.log(`[Notification] Found ${subscriptions.length} subscriptions.`);

        const payload = JSON.stringify({
            title,
            body: message,
        });

        const results = await Promise.allSettled(
            subscriptions.map((sub) => {
                const keys = sub.keys as unknown as PushSubscriptionKeys;
                return webPush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: keys,
                    },
                    payload
                ).then((res) => {
                    console.log(`[Notification] Sent to ${sub.endpoint.slice(0, 20)}...: Status ${res.statusCode}`);
                    return res;
                }).catch((err) => {
                    console.error(`[Notification] Failed to send to ${sub.endpoint.slice(0, 20)}...:`, err);
                    throw err;
                });
            })
        );

        // Cleanup invalid subscriptions
        const invalidSubscriptions = results
            .map((result: PromiseSettledResult<unknown>, index: number) => {
                if (result.status === "rejected") {
                    const reason = result.reason as { statusCode?: number };
                    if (reason.statusCode === 410 || reason.statusCode === 404) {
                        return subscriptions[index].endpoint;
                    }
                }
                return null;
            })
            .filter(Boolean);

        if (invalidSubscriptions.length > 0) {
            await prisma.pushSubscription.deleteMany({
                where: {
                    endpoint: {
                        in: invalidSubscriptions as string[],
                    },
                },
            });
        }

        return { success: true, sentCount: results.filter((r: PromiseSettledResult<unknown>) => r.status === "fulfilled").length };
    } catch (error) {
        console.error("Failed to send notifications:", error);
        return { success: false, error: "Failed to send notifications" };
    }
}
