"use client";

import { useEffect, useState } from "react";
import { saveSubscription } from "@/app/actions";

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function PushManager({ agentId }: { agentId?: string }) {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [debugMsg, setDebugMsg] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // Detect Standalone (PWA)
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsStandalone(isStandaloneMode);

        if (typeof window !== 'undefined' && window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            setDebugMsg("HTTPS required");
            return;
        }

        if (!("serviceWorker" in navigator)) {
            setDebugMsg("No SW support");
            return;
        }

        if (!("PushManager" in window)) {
            if (isIosDevice && !isStandaloneMode) {
                // Don't show error, show instruction
                return;
            }
            setDebugMsg("No Push API");
            return;
        }
        setIsSupported(true);
        registerServiceWorker();
    }, []);

    async function registerServiceWorker() {
        try {
            // Try to register custom-sw.js directly since sw.js might not exist in dev
            if (!navigator.serviceWorker.controller) {
                await navigator.serviceWorker.register('/custom-sw.js');
            }

            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.getSubscription();
            setSubscription(sub);
        } catch (error) {
            console.error("Service Worker registration failed:", error);
            setDebugMsg("SW Reg Failed");
        }
    }

    async function subscribeToPush() {
        setIsLoading(true);
        setDebugMsg("");
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                ),
            });

            setSubscription(sub);
            await saveSubscription(JSON.parse(JSON.stringify(sub)), agentId);
            alert("Subscribed to mission updates!");
        } catch (error: unknown) {
            console.error("Failed to subscribe:", error);
            const errorMessage = error instanceof Error ? error.message : "Sub failed";
            setDebugMsg(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    if (isIOS && !isStandalone) {
        return (
            <div className="text-[10px] text-yellow-500 font-mono border border-yellow-500/50 px-2 py-1 bg-yellow-900/10">
                INSTALL APP TO ENABLE ALERTS (SHARE -&gt; ADD TO HOME SCREEN)
            </div>
        );
    }

    if (!isSupported && !debugMsg) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            {debugMsg && (
                <span className="text-red-500 text-[10px] font-mono mr-2 border border-red-500 px-1">
                    {debugMsg}
                </span>
            )}
            {subscription ? (
                <div className="text-green-500 text-xs font-mono border border-green-500 px-2 py-1 bg-green-900/20">
                    ALERTS ACTIVE
                </div>
            ) : (
                <button
                    onClick={subscribeToPush}
                    disabled={!isSupported || isLoading}
                    className="bg-green-900/30 hover:bg-green-900/50 text-green-400 border border-green-500/50 px-2 py-1 text-xs font-mono transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    {isLoading ? "..." : "ENABLE ALERTS"}
                </button>
            )}
        </div>
    );
}
