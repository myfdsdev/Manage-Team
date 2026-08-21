import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function JoinAdmin() {
  const navigate = useNavigate();
  const { joinAdmin } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) return toast.error("Please enter your name");
    if (!EMAIL_RE.test(trimmedEmail)) return toast.error("Please enter a valid email");
    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");

    setSubmitting(true);
    try {
      const result = await joinAdmin(trimmedName, trimmedEmail, password);
      if (result?.existing) {
        toast("You already have an account — please log in.", { icon: "👋" });
        navigate("/Login", { replace: true });
        return;
      }
      toast.success("Access unlocked! Let's set up your workspace.");
      navigate("/CompanySetup", { replace: true });
    } catch (err) {
      toast.error(err?.error || err?.message || "Could not unlock access");
    } finally {
      setSubmitting(false);
    }
  };

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

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <div className="mb-8">
          <BrandLogo className="h-10" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-lime-400/15 bg-[#020806] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.6)]"
        >
          <h1 className="text-2xl font-bold text-white">Unlock access</h1>
          <p className="mt-2 text-sm text-white/60">
            Enter your name and email to get started. We'll email you and take you
            straight to setting up your workspace.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/75">Name</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  autoComplete="name"
                  className="border-lime-400/15 bg-black pl-9 text-white placeholder:text-white/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/75">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  autoComplete="email"
                  className="border-lime-400/15 bg-black pl-9 text-white placeholder:text-white/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/75">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className="border-lime-400/15 bg-black pl-9 text-white placeholder:text-white/30"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-lime-400 text-black hover:bg-lime-300"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Unlocking…
                </>
              ) : (
                <>
                  Unlock &amp; continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-white/40">
            Already have a workspace?{" "}
            <button
              type="button"
              onClick={() => navigate("/Login")}
              className="text-lime-300 hover:underline"
            >
              Log in
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
