import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, PlayCircle } from "lucide-react";

// Training videos shown to the team. Add more by appending to this list —
// `id` is the YouTube video id (the part after `watch?v=`).
const TRAININGS = [
  {
    id: "chUUdHVFWyg",
    title: "Bookappointment Demo",
    author: "AppsFieldAI Store",
    description:
      "A full product walkthrough — watch this to get up to speed with the workflow.",
  },
];

export default function Training() {
  return (
    <div className="min-h-screen bg-black p-4 text-white md:p-6 xl:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-5xl space-y-8"
      >
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-white">
            <GraduationCap className="h-8 w-8 text-lime-400" />
            Training Center
          </h1>
          <p className="mt-1 text-white/60">
            Watch tutorials and demos to get the most out of the platform.
          </p>
        </div>

        {TRAININGS.length === 0 ? (
          <div className="rounded-2xl border border-lime-400/15 bg-[#020806] p-12 text-center text-white/50">
            No training videos yet.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {TRAININGS.map((t) => (
              <div
                key={t.id}
                className="overflow-hidden rounded-2xl border border-lime-400/15 bg-[#020806]"
              >
                <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube.com/embed/${t.id}`}
                    title={t.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start gap-2">
                    <PlayCircle className="mt-0.5 h-5 w-5 shrink-0 text-lime-300" />
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-white">{t.title}</h3>
                      {t.author && (
                        <p className="text-xs text-white/40">{t.author}</p>
                      )}
                      {t.description && (
                        <p className="mt-2 text-sm leading-relaxed text-white/60">
                          {t.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
