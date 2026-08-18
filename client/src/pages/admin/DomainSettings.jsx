import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Copy, Globe, Loader2 } from "lucide-react";

import { base44 } from "@/api/base44Client";
import { useCompany } from "@/lib/CompanyContext";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const MAIN_DOMAIN = import.meta.env.VITE_MAIN_DOMAIN || "yourapp.com";

const copy = (text) => {
  navigator.clipboard.writeText(String(text));
  toast.success("Copied!");
};

const inputClass =
  "border-lime-400/15 bg-black text-white placeholder:text-white/30";

export default function DomainSettings() {
  const { company, refreshCompany, loading } = useCompany();

  const [newSubdomain, setNewSubdomain] = useState("");
  const [savingSub, setSavingSub] = useState(false);

  const updateSubdomain = async () => {
    if (!newSubdomain) return;
    setSavingSub(true);
    try {
      await base44.domains.updateSubdomain(newSubdomain);
      await refreshCompany();
      toast.success("Subdomain updated!");
      setNewSubdomain("");
    } catch (err) {
      toast.error(err?.error || err?.message || "Failed to update subdomain");
    } finally {
      setSavingSub(false);
    }
  };

  if (loading && !company) {
    return (
      <div className="min-h-screen bg-black p-8 text-white">
        <Loader2 className="w-6 h-6 animate-spin text-lime-400" />
      </div>
    );
  }

  const subdomainUrl = company?.subdomain
    ? `https://${company.subdomain}.${MAIN_DOMAIN}`
    : "";

  return (
    <div className="min-h-screen bg-black p-4 text-white md:p-6 xl:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
            <Globe className="w-8 h-8 text-lime-400" />
            Domain Settings
          </h1>
          <p className="text-white/60 mt-1">
            Manage how customers access your workspace
          </p>
        </div>

        {/* Subdomain */}
        <Card className="border-lime-400/15 bg-black text-white">
          <CardHeader>
            <CardTitle className="text-white">Workspace URL (Free)</CardTitle>
            <CardDescription className="text-white/60">
              Your default subdomain — always available
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-lime-400/15 bg-black/60 p-4">
              <code className="flex-1 break-all text-sm text-white">
                https://
                <span className="font-bold text-lime-300">
                  {company?.subdomain || "—"}
                </span>
                .{MAIN_DOMAIN}
              </code>
              {company?.subdomain && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white/70 hover:bg-lime-400/10 hover:text-lime-300"
                  onClick={() => copy(subdomainUrl)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="new-subdomain"
                className={inputClass}
                value={newSubdomain}
                onChange={(e) =>
                  setNewSubdomain(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  )
                }
              />
              <Button
                onClick={updateSubdomain}
                disabled={!newSubdomain || savingSub}
                className="bg-lime-400 text-black hover:bg-lime-300"
              >
                {savingSub ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Update Subdomain"
                )}
              </Button>
            </div>
            <p className="text-xs text-white/50">
              3–30 characters, lowercase letters, numbers, dashes only
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
