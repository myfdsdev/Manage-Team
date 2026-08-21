import React from "react";
import logo from "@/assets/manageteam-logo.png";

// The full manageteam wordmark logo (icon + "manageteam"). Used on the
// platform-brand surfaces — welcome, login/register, the join pages and the
// no-access screen. Transparent PNG, so it sits cleanly on the dark UI.
export default function BrandLogo({ className = "h-9" }) {
  return (
    <img
      src={logo}
      alt="manageteam"
      className={`w-auto select-none ${className}`}
      draggable={false}
    />
  );
}
