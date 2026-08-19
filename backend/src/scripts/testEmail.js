// Send a real test email through Resend to verify your setup.
//
//   node src/scripts/testEmail.js you@example.com
//
// Requires RESEND_API_KEY in backend/.env and a verified sending domain
// (or use Resend's shared onboarding@resend.dev as RESEND_FROM for a first test,
// which can only deliver to the email on your own Resend account).
import "dotenv/config";
import { sendWelcomeEmail } from "../utils/sendEmail.js";

const to = process.argv[2];

if (!to) {
  console.error("Usage: node src/scripts/testEmail.js <recipient@example.com>");
  process.exit(1);
}

if (!process.env.RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY is not set in backend/.env");
  process.exit(1);
}

try {
  console.log(`Sending test 'welcome' email to ${to} ...`);
  const result = await sendWelcomeEmail(to, "there");
  console.log("✅ Done:", result?.id ? `id=${result.id}` : JSON.stringify(result));
  process.exit(0);
} catch (err) {
  console.error("❌ Failed:", err.message);
  process.exit(1);
}
