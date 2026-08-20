import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, CalendarDays } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Row labels down the left edge — GitHub shows Mon / Wed / Fri (rows 1, 3, 5;
// row 0 is Sunday because the grid is Sunday-anchored).
const DOW = ["", "Mon", "", "Wed", "", "Fri", ""];

// Intensity → cell color (kept on the app's lime theme). 0 = no activity.
const cellClass = (intensity) =>
  ({
    0: "bg-lime-400/[0.07]",
    1: "bg-lime-400/25",
    2: "bg-lime-400/45",
    3: "bg-lime-400/70",
    4: "bg-lime-300",
  }[intensity] || "bg-lime-400/[0.07]");

const isoLocal = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

// Build ~53 Sunday-anchored week columns of 7 day rows, ending on today's week.
// Returns the weeks plus a parallel list of month labels (shown once per month).
const buildGrid = (days) => {
  const byDate = new Map((days || []).map((d) => [d.date, d]));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cursor = new Date(today);
  cursor.setDate(cursor.getDate() - 7 * 52); // ~1 year back
  cursor.setDate(cursor.getDate() - cursor.getDay()); // align to Sunday

  const weeks = [];
  const monthLabels = [];
  let prevMonth = -1;

  while (cursor <= today) {
    const weekMonth = cursor.getMonth();
    const week = [];
    for (let i = 0; i < 7; i += 1) {
      const key = isoLocal(cursor);
      const future = cursor > today;
      const rec = byDate.get(key);
      week.push({
        date: key,
        future,
        intensity: future ? -1 : rec?.intensity ?? 0,
        hours: rec?.hours ?? 0,
        status: rec?.status,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    monthLabels.push(weekMonth !== prevMonth ? MONTHS[weekMonth] : "");
    prevMonth = weekMonth;
  }

  return { weeks, monthLabels };
};

export default function AttendanceChart({ trend = [], heatmap = [] }) {
  const { weeks, monthLabels } = buildGrid(heatmap);
  const activeDays = (heatmap || []).filter((d) => (d?.intensity ?? 0) > 0).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-lime-300" />
          Attendance Trend
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(163, 230, 53, 0.12)" />
              <XAxis dataKey="month" tick={{ fill: "rgba(236,255,220,0.55)", fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "rgba(236,255,220,0.55)", fontSize: 12 }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip
                formatter={(value, name) => [
                  name === "attendanceRate" ? `${value}%` : value,
                  name === "attendanceRate" ? "Attendance" : name,
                ]}
                contentStyle={{
                  background: "#020806",
                  color: "#fff",
                  border: "1px solid rgba(163, 230, 53, 0.18)",
                  borderRadius: 12,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.28)",
                }}
              />
              <Line
                type="monotone"
                dataKey="attendanceRate"
                stroke="#a3e635"
                strokeWidth={3}
                dot={{ r: 4, fill: "#a3e635" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* GitHub-style contribution heatmap */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-lime-100/45" />
            <p className="text-sm font-medium text-lime-100/60">
              {activeDays} active {activeDays === 1 ? "day" : "days"} in the last year
            </p>
          </div>

          <div className="overflow-x-auto pb-1">
            <div className="inline-block">
              {/* Month labels */}
              <div className="flex gap-[3px] mb-1">
                <div className="w-8 shrink-0" />
                {monthLabels.map((label, wi) => (
                  <div key={wi} className="w-3 shrink-0 relative">
                    <span className="absolute left-0 -top-0.5 whitespace-nowrap text-[10px] text-lime-100/45">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Day-of-week labels + week columns */}
              <div className="flex gap-[3px]">
                <div className="flex flex-col gap-[3px] w-8 shrink-0">
                  {DOW.map((d, i) => (
                    <div key={i} className="h-3 leading-3 text-[10px] text-lime-100/45">
                      {d}
                    </div>
                  ))}
                </div>

                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px] shrink-0">
                    {week.map((day) => (
                      <div
                        key={day.date}
                        title={
                          day.future
                            ? ""
                            : `${day.date}: ${day.hours}h${
                                day.status ? ` (${day.status})` : " (no record)"
                              }`
                        }
                        className={`h-3 w-3 rounded-sm ${
                          day.future ? "bg-transparent" : cellClass(day.intensity)
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1 mt-3 text-[11px] text-lime-100/45">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-3 w-3 rounded-sm ${cellClass(i)}`} />
            ))}
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
