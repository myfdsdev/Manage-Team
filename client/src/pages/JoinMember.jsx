import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Defined at module scope (NOT inside the component) so it keeps a stable
// identity across re-renders. If it lived inside JoinMember, every keystroke
// would create a new component type and React would remount the whole subtree —
// dropping input focus and replaying the entrance animation.
const Shell = ({ children }) => (
  <div className="relative min-h-screen overflow-hidden bg-black text-white">
    <motion.div
      className="pointer-events-none absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-lime-400/10 blur-3xl"
      animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
    />
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
      {children}
    </div>
  </div>
);

export default function JoinMember() {
  const navigate = useNavigate();
  const { joinMember } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState(null); // { valid, email, company_name }
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!token) {
      setLoading(false);
      setInvite({ valid: false });
      return;
    }
    base44.auth
      .getInvite(token)
      .then((res) => {
        if (!alive) return;
        setInvite(res);
        if (res?.valid && res.email) setEmail(res.email);
      })
      .catch(() => alive && setInvite({ valid: false }))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return toast.error("Please enter your name");
    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");

    setSubmitting(true);
    try {
      const result = await joinMember({
        token,
        name: trimmedName,
        email: email.trim().toLowerCase(),
        password,
      });
      if (result?.existing) {
        toast("You already have an account — please log in.", { icon: "👋" });
        navigate("/Login", { replace: true });
        return;
      }
      toast.success(`Welcome to ${invite?.company_name || "the team"}!`);
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err?.error || err?.message || "Could not join the workspace");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Shell>
        <Loader2 className="h-7 w-7 animate-spin text-lime-400" />
      </Shell>
    );
  }

  if (!invite?.valid) {
    return (
      <Shell>
        <div className="w-full max-w-md rounded-2xl border border-rose-500/20 bg-[#020806] p-8 text-center">
          <h1 className="text-xl font-bold text-white">Invitation not valid</h1>
          <p className="mt-2 text-sm text-white/60">
            This invitation link is invalid, has already been used, or has expired.
            Please ask your admin to send a new one.
          </p>
          <Button
            onClick={() => navigate("/Login")}
            className="mt-6 w-full bg-lime-400 text-black hover:bg-lime-300"
          >
            Go to login
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-8">
        <BrandLogo className="h-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-lime-400/15 bg-[#020806] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.6)]"
      >
        <h1 className="text-2xl font-bold text-white">
          Join {invite.company_name}
        </h1>
        <p className="mt-2 text-sm text-white/60">
          You've been invited to join <strong>{invite.company_name}</strong>. Create
          your account to get started.
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
                readOnly
                autoComplete="email"
                className="border-lime-400/15 bg-black/60 pl-9 text-white/70"
              />
            </div>
            <p className="text-xs text-white/40">This invite is tied to your email.</p>
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining…
              </>
            ) : (
              <>
                Join workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </Shell>
  );
}
