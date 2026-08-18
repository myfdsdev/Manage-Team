import dotenv from "dotenv";
dotenv.config();

import { Resend } from "resend";

console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "FOUND" : "MISSING");

let resend = null;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log("✅ Resend email API ready");
} else {
  console.log("⚠️ RESEND_API_KEY not set — emails disabled");
}

export default resend;
