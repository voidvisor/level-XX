"use client";

import { useMissionState } from "@/hooks/useMissionState";
import RSVPForm from "@/components/RSVPForm";
import GameVoting from "@/components/GameVoting";
import PizzaVoting from "@/components/PizzaVoting";
import PushManager from "@/components/PushManager";
import InstallPrompt from "@/components/InstallPrompt";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useMemo } from "react";

export default function Home() {
  const [connectionId, setConnectionId] = useState("");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [initialStatus, setInitialStatus] = useState<string | null>(null);
  const [initialTransportMode, setInitialTransportMode] = useState<string | null>(null);

  const {
    currentStage,
    isVotingOpen,
    showBombManual,

    isPizzaVotingOpen,
    myVote,
    myPizzaVote,
    isLoading,
    isError,
    mutate
  } = useMissionState(connectionId);

  const [showGlitch, setShowGlitch] = useState(false);
  const [displayedStage, setDisplayedStage] = useState(currentStage);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setDisplayedStage(currentStage);
      setShowGlitch(true);
      const timer = setTimeout(() => setShowGlitch(false), 1000);
      return () => clearTimeout(timer);
    }

    if (currentStage !== displayedStage) {
      setShowGlitch(true);

      // Change content halfway through the glitch
      const contentTimer = setTimeout(() => {
        setDisplayedStage(currentStage);
      }, 500);

      const glitchTimer = setTimeout(() => {
        setShowGlitch(false);
      }, 1000);

      return () => {
        clearTimeout(contentTimer);
        clearTimeout(glitchTimer);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStage]);

  useEffect(() => {
    const checkAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get("id");

      let idToVerify = urlId;

      if (!idToVerify) {
        idToVerify = localStorage.getItem("agentId"); // Changed from agent_id to agentId
      }

      if (idToVerify) {
        setConnectionId(idToVerify); // Set connectionId early
        const { verifyAgent } = await import("@/app/actions");
        const result = await verifyAgent(idToVerify);

        if (result.success) {
          localStorage.setItem("agentId", idToVerify); // Changed from agent_id to agentId
          setInitialStatus(result.status || "PENDING"); // Set initialStatus with default
          setInitialTransportMode(result.transportMode || null);
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } else {
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, []);

  const STAGES = useMemo(() => ({
    0: {
      title: "AWAITING SIGNAL",
      content: (
        <div className="space-y-6">
          <div className="border border-green-500 p-4 bg-green-900/20 text-center">
            <p className="text-xl font-bold">MISSION DATE: XX.XX.20XX.</p>
            <p className="text-xl font-bold">MISSION TIME: XX:XX-??:??</p>
            <p className="text-sm mt-4 text-green-400/80 font-mono">
              ADVISORY: OPERATIONAL ENVIRONMENT MAY BE UNCLEAN.
              TACTICAL GEAR (OR CLOTHES YOU DON'T MIND GETTING DIRTY) RECOMMENDED.
            </p>

          </div>
          <RSVPForm agentId={connectionId} initialStatus={initialStatus} initialTransportMode={initialTransportMode} />
        </div>
      ),
    },
    1: {
      title: "SAFE HOUSE LOCATED",
      content: (
        <div className="text-center space-y-4">
          <h3 className="text-xl text-green-400">TARGET: [CLASSIFIED]</h3>
          <p className="text-lg">REGROUP FOR BRIEFING</p>
          <div className="border border-green-500 p-4 inline-block bg-green-900/20">
            <p className="text-2xl font-mono">XX.XXXX, XX.XXXX</p>
          </div>
        </div>
      ),
    },
    2: {
      title: "OPS CENTER ACTIVE",
      content: (
        <div className="space-y-6">
          <div className="border border-green-500 p-4 bg-green-900/20">
            <h3 className="text-xl font-bold mb-4 text-center">OPERATIONAL PARAMETERS</h3>
            <p className="mb-4 text-justify">
              AGENTS, YOUR NEXT OBJECTIVE REQUIRES COORDINATED EFFORT.
              SELECT A SIMULATION MODULE TO COMMENCE TRAINING.
            </p>

            <GameVoting agentId={connectionId} isVotingOpen={isVotingOpen} serverVote={myVote} onRefresh={mutate} />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="grid gap-4 text-center font-mono text-sm">
              {showBombManual && (
                <a href="https://bombmanual.com/web/index.html" target="_blank" className="block p-3 border border-green-500/50 hover:bg-green-500/20 text-green-400 hover:text-green-300 transition-colors">
                  BOMB MANUAL
                </a>
              )}

            </div>

            {isPizzaVotingOpen && (
              <div className="border border-green-500 p-4 bg-green-900/20">
                <PizzaVoting agentId={connectionId} isPizzaVotingOpen={isPizzaVotingOpen} serverVote={myPizzaVote} onRefresh={mutate} />
              </div>
            )}
          </div>
        </div>
      ),
    },
    3: {
      title: "MISSION ACCOMPLISHED",
      content: (
        <div className="space-y-6 text-center">
          <div className="border border-green-500 p-8 bg-green-900/20">
            <h3 className="text-2xl font-bold mb-4 text-green-400">OBJECTIVES COMPLETE</h3>
            <p className="text-lg mb-4">
              EXCELLENT WORK, AGENTS.
              THE SYSTEM HAS BEEN SECURED.
            </p>
            <p className="text-sm opacity-70 font-mono mt-8">
              THANK YOU FOR YOUR SERVICE.
              DISMISSED.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-16 h-16 border-2 border-green-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-2xl">✓</span>
            </div>
          </div>

          <div className="mt-8 border border-green-500/50 p-2 bg-black">
            <p className="text-xs text-green-400 mb-2 font-mono">MISSION DEBRIEF_Recap.mp4</p>
            <video
              controls
              className="w-full aspect-video border border-green-900"
              poster="/video-thumbnail.jpg"
            >
              <source src="/recap.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      ),
    },
  }), [connectionId, initialStatus, initialTransportMode, isVotingOpen, myVote, mutate, showBombManual, isPizzaVotingOpen, myPizzaVote]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="animate-pulse text-green-500">VERIFYING CREDENTIALS...</p>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500 space-y-6 p-4 text-center">
        <h1 className="text-6xl font-bold glitch-effect" data-text="ACCESS DENIED">ACCESS DENIED</h1>
        <div className="border border-red-500 p-4 bg-red-900/20">
          <p className="font-mono text-lg mb-2">UNAUTHORIZED DEVICE DETECTED</p>
          <p className="text-sm opacity-70">PLEASE SCAN A VALID MISSION QR CODE</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="animate-pulse text-green-500">ESTABLISHING UPLINK...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500 space-y-4">
        <h1 className="text-4xl font-bold glitch-effect" data-text="CONNECTION LOST">CONNECTION LOST</h1>
        <p className="animate-pulse">RETRYING UPLINK...</p>
      </div>
    );
  }

  if (initialStatus === "MIA") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500 space-y-6 p-4 text-center">
        <div className="border-2 border-red-500 p-8 bg-black/80 max-w-md w-full">
          <h2 className="text-4xl font-bold mb-4 glitch-effect text-red-500" data-text="STATUS: MIA">
            STATUS: MIA
          </h2>
          <p className="text-lg text-red-400 mb-6">
            ACKNOWLEDGED. STAND DOWN, AGENT.
          </p>
          <div className="text-xs opacity-50 font-mono border-t border-red-500/30 pt-4">
            <p>COMMUNICATION TERMINATED</p>
            <p className="mt-2">ID: {connectionId}</p>
          </div>
        </div>
      </div>
    );
  }

  const stageData = STAGES[displayedStage as keyof typeof STAGES] || STAGES[0];

  return (
    <main className="min-h-screen p-4 flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-green-500 pb-2 mb-8">
        <h1 className="text-xl font-bold glitch-effect" data-text="MISSION INTERFACE">
          MISSION INTERFACE
        </h1>
        <div className="flex items-center gap-4">
          <PushManager agentId={connectionId} />
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs">SYNC: CONNECTED</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          {showGlitch ? (
            <motion.div
              key="glitch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black z-50"
            >
              <h1 className="text-5xl font-bold text-red-500 glitch-effect" data-text="SYSTEM UPDATE">
                SYSTEM UPDATE
              </h1>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl"
            >
              <div className="mb-8 text-center">
                <h2 className="text-4xl font-bold mb-2 text-green-400 glitch-effect" data-text={stageData.title}>
                  {stageData.title}
                </h2>
              </div>

              {stageData.content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs opacity-50 font-mono">
        <p>SECURE CONNECTION // ENCRYPTED</p>
        <p>ID: {connectionId}</p>
      </footer>
      <InstallPrompt />
    </main >
  );
}
