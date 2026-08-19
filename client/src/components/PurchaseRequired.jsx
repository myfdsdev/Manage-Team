import React from "react";
import { motion } from "framer-motion";
import { Lock, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

// Full-screen paywall shown to any logged-in user who hasn't unlocked the app.
export default function PurchaseRequired() {
  const { user, logout } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <motion.div
        className="pointer-events-none absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-lime-400/10 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-emerald-400/10 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-lime-400/15 bg-[#020806] p-8 text-center shadow-[0_30px_120px_rgba(0,0,0,0.6)]"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-lime-400/30 bg-lime-400/10">
            <Lock className="h-8 w-8 text-lime-300" />
          </div>

          <h1 className="text-2xl font-bold text-white">You can't access the app</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            {user?.full_name ? `Hi ${user.full_name.split(" ")[0]}, your` : "Your"}{" "}
            account isn't unlocked yet. You have to buy the app to continue.
          </p>

          <button
            type="button"
            onClick={() => logout()}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-lime-400/15 px-5 py-2.5 text-sm text-white/60 transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-200"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </motion.div>
      </div>
    </div>
  );
}
