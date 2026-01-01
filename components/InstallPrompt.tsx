"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        if (isStandaloneMode) {
            setIsStandalone(true);
            return;
        }

        // Check if dismissed previously
        const isDismissed = localStorage.getItem("installPromptDismissed");
        if (isDismissed) return;

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        if (isIosDevice) {
            // Show prompt for iOS after a small delay
            const timer = setTimeout(() => setShowPrompt(true), 2000);
            return () => clearTimeout(timer);
        }

        // Capture beforeinstallprompt event for Android/Chrome
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setShowPrompt(false);
            }
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem("installPromptDismissed", "true");
    };

    if (!showPrompt || isStandalone) return null;

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 p-4 z-50 flex justify-center"
                >
                    <div className="bg-black border border-green-500 p-4 max-w-md w-full shadow-[0_0_20px_rgba(0,255,65,0.2)]">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-green-500 font-bold glitch-effect" data-text="SECURE UPLINK AVAILABLE">
                                SECURE UPLINK AVAILABLE
                            </h3>
                            <button onClick={handleDismiss} className="text-green-500/50 hover:text-green-500">
                                [X]
                            </button>
                        </div>

                        <p className="text-sm text-green-400/80 mb-4 font-mono">
                            ESTABLISH DEDICATED CONNECTION FOR ENHANCED MISSION CAPABILITIES.
                        </p>

                        {isIOS ? (
                            <div className="text-xs font-mono text-green-300 border border-green-500/30 p-2 bg-green-900/10">
                                <p>1. TAP THE SHARE BUTTON <span className="inline-block border border-green-500/50 px-1">⎋</span></p>
                                <p>2. SELECT "ADD TO HOME SCREEN" <span className="inline-block border border-green-500/50 px-1">+</span></p>
                            </div>
                        ) : (
                            <button
                                onClick={handleInstallClick}
                                className="w-full bg-green-500 text-black font-bold py-2 hover:bg-green-400 transition-colors"
                            >
                                INITIALIZE INSTALLATION
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
